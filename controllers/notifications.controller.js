const Notification = require('../models/notification.model')
const { serializeNotifs } = require('../serializers/notification.serializer')

exports.notificationRead = async (req, res, next) => {
    try {
        let { _id = null } = req.params;
        let user = req.user;
        await Notification.updateOne({ user_id: user._id, 'notifications._id': _id }, {
            $set: { 'notifications.$.read': true }
        })
        res.json({ msg: "Notification marked read" })
    } catch (err) {
        next(err)
    }
}
exports.getNotifications = async (req, res, next) => {
    try {
        let user = req.user
        let doc = await Notification.findOne({ user_id: user._id }, 'notifications')
        if (doc)
            res.json({ notifications: await serializeNotifs(doc) })
        else
            res.json({ notifications: null, message: "Empty" })
    } catch (err) {
        next(err)
    }
}