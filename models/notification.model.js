const mongoose = require('mongoose')
const { sendData: sendSocketData } = require('../socketApi')
const { serializeNotifs } = require('../serializers/notification.serializer')

const subdocSchema = new mongoose.Schema({
    type: String, // 'mentioned' || '(un)followed' || 'recomendation' || 'update'
    title: String,
    body: {
        type: Object,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        link: String
    },
    read: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

const notifySchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    // notifications list (sub documents), not refs as will be capped to like 20 or so anyway
    notifications: [subdocSchema]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

notifySchema.statics.push = async function (user_id, ...notifs) {
    let doc = await this.findOne({ user_id })
    if (!doc)
        doc = await this.create({ user_id })
    return doc.push(...notifs)
}
notifySchema.methods.push = function (...notifs) {
    const maxSize = 7
    this.notifications.push({
        $each: notifs,
        $sort: { created_at: -1 },
        $slice: maxSize
    })
    return this.save()
}

notifySchema.post('save', sendUnreadNotifs)
async function sendUnreadNotifs(doc) {
    let notifications = await serializeNotifs(doc)
    notifications = notifications.filter(n => !n.read)
    // send via socket
    sendSocketData('notifications', doc.user_id, notifications)
    // TODO Send via push
}

module.exports = mongoose.model('Notification', notifySchema)