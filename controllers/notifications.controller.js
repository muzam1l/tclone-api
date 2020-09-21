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
exports.subscribeDevice = async (req, res, next) => {
    try {
        const user = req.user;
        const subscription = req.body
        if (!subscription.endpoint || !subscription.keys) { // Not a valid subscription.
            res.status(400).json({ msg: 'Invalid subscription' })
            return
        }
        if (!await Notification.exists({
            user_id: user._id,
            'subscriptions.endpoint': subscription.endpoint
        })) {
            console.log('saving subscription in db')
            await Notification.updateOne({ user_id: user._id }, {
                $push: { subscriptions: subscription }
            }, { upsert: true })
            const session = req.session;
            session.endpoint = subscription.endpoint;
            session.save()
        } else { console.log('Subscription already exists') }

        res.status(200).json({ 'success': true })
    } catch (err) {
        next(err)
    }
}
exports.unsubscribeDevice = async (req, res, next) => {
    try {
        const user = req.user;
        const endpoint = req.session.endpoint;
        if (!endpoint) {
            console.log('no endpoint in session')
            return res.status(400).json({ msg: 'Not subscripbed' })
        }
        await Notification.updateOne({ user_id: user._id }, {
            $pull: { subscriptions: { endpoint } }
        })
        res.json({ msg: 'Ok' })
    } catch (err) {
        next(err)
    }
}