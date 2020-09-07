const { Document } = require('mongoose')
const Friendship = require('../models/friendship.model')

/**
 * serializes user with fields required by client user
 */
exports.serializeUser = async (user, client = null) => {
    if (!user)
        return

    if (user.toObject)
        user = user.toObject()
    if (!client)
        return user
    let following = await Friendship.isFollowing(client._id, user._id)
    return ({
        ...user,
        following
    })
}
exports.serializeUsers = async (users = [], client) => {
    if (!users instanceof Array)
        throw Error("Unknown type")
    return Promise.all(users.map(user => this.serializeUser(user, client)))
}