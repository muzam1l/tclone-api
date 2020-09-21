const { Document } = require('mongoose')
const Friendship = require('../models/friendship.model')
const { serializeUser } = require('./user.serializer')
const { serializePost } = require('./post.serializer')

exports.serializeNotif = async (notif, client) => {
    if (!notif)
        return

    //serialize user field
    let user = null
    if (notif.body.user)
        user = await serializeUser(notif.body.user, client)
    let post = null
    if (notif.body.post)
        post = await serializePost(notif.body.post, client)

    notif = notif.toObject()
    return ({
        ...notif,
        body: {
            ...notif.body,
            user,
            post
        }
    })
}


exports.serializeNotifs = async doc => {
    if (!doc instanceof Document)
        throw Error('Unknown Notification object')
    doc = await doc
        .populate({
            path: 'notifications.body.user',
            model: 'User'
        })
        .populate({
            path: 'notifications.body.post',
            model: 'Post'
        }).execPopulate()
    return Promise.all(doc.notifications.map(notif => this.serializeNotif(notif, doc.user_id)))
}