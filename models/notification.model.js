const mongoose = require('mongoose')
// const { sendData: sendSocketData } = require('../socketApi')
const { serializeNotifs } = require('../serializers/notification.serializer')
const webpush = require('web-push')

const subdocSchema = new mongoose.Schema({
    type: String, // 'replied' || 'mentioned' || '(un)followed' || 'liked' || 'reposted' <| ||  'quoted' || 'recomendation' || 'update'
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
    notifications: [subdocSchema],

    // push subscription for each device
    subscriptions: [{}]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

notifySchema.statics.push = async function (user_id, ...notifs) {
    let doc = await this.findOne({ user_id })
    if (!doc)
        doc = await this.create({ user_id })
    return doc.push(...notifs)
}
notifySchema.methods.push = async function (...notifs) {
    const maxSize = 7
    this.notifications.push({
        $each: notifs,
        $sort: { created_at: -1 },
        $slice: maxSize
    })
    notifs = this.notifications.slice(-notifs.length)
    // now we have notifs with _id
    notifs.forEach(notif => sendPushNotif(notif, this.subscriptions, this.user_id))
    return this.save()
}
// notifySchema.post('save', sendSocketNotifs)

/**
 * 
 * @param {mongoose.Document} notif Notifiaction object containing details
 * @param {Array} subscriptions subscriptions of a user to send to
 * @param {mongoose.ObjectId} user_id of user to send notification to
 */
async function sendPushNotif(notif, subscriptions, user_id) {
    if (!subscriptions.length)
        return
    // Send via push
    let page, body, title = notif.title
    if (notif.type === 'mentioned') {
        let post = await mongoose.model('Post').findById(notif.body.post).populate('user')
        page = `/post/${post.id_str}`
        body = post.text
        title = `@${post.user.screen_name} mentioned you in a post`
    }
    else if (notif.type === 'followed') {
        const user = await mongoose.model('User').findById(notif.body.user)
        const client = await mongoose.model('User').findById(user_id)
        // page = `/user/${user.screen_name}`
        page = `/user/${client.screen_name}/followers`
        title = `@${user.screen_name} started following you 🥳`
        body = 'Wanna follow them back 🥺'
    }
    else if (notif.type === 'unfollowed') {
        let user = await mongoose.model('User').findById(notif.body.user)
        page = `/user/${user.screen_name}`
        title = `@${user.screen_name} no longer follows you 😬`
        body = 'Wanna unfollow them too 😈'
    }
    else if (notif.type === 'liked') {
        let user = await mongoose.model('User').findById(notif.body.user)
        let post = await mongoose.model('Post').findById(notif.body.post)
        title = `@${user.screen_name} liked your post`
        page = `/post/${post.id_str}/likes`
        body = post.text
    }
    else if (notif.type === 'reposted') {
        let user = await mongoose.model('User').findById(notif.body.user)
        let post = await mongoose.model('Post').findById(notif.body.post)
        title = `@${user.screen_name} reposted your post`
        page = `/post/${post.id_str}/reposts`
        body = post.text
    }
    else if (notif.type === 'replied') {
        let reply_post = await mongoose.model('Post').findById(notif.body.post).populate('user')
        title = `@${reply_post.user.screen_name} replied`
        page = `/post/${reply_post.id_str}`
        body = reply_post.text
    }
    // maybe more types in future

    const payload = JSON.stringify({
        title: title,
        options: {
            data: {
                page,
                _id: notif._id
            },
            body: body
        }
    })
    subscriptions.forEach(subscription =>
        webpush.sendNotification(subscription, payload)
            .catch(e => {
                console.log(e)
                if (e.statusCode === 410 || e.statusCode === 404) {
                    mongoose.model('Notification').updateOne({ 'subscriptions.endpoint': subscription.endpoint }, {
                        $pull: { subscriptions: { endpoint: subscription.endpoint } }
                    }).then(res => {
                        console.log('removed subscription from db', res)
                    })
                }
            }))
}

/*
async function sendSocketNotifs(doc) {
    let notifications = await serializeNotifs(doc)
    // notifications = notifications.filter(n => !n.read)
    // Send all
    sendSocketData('notifications', doc.user_id, notifications)
}
*/

module.exports = mongoose.model('Notification', notifySchema)