const { Document } = require('mongoose')
const Friendship = require('../models/friendship.model')
const User = require('../models/user.model')

/**
 * serializes user with fields required by client user
 */
exports.serializeUser = async (user, client = null) => {
    if (!user)
        return

    if (user.toObject)
        user = user.toObject()
    let followers_count = await Friendship.countFollowers(user._id)
    let friends_count = await Friendship.countFriends(user._id)
    let statuses_count = await User.countPosts(user._id)
    let following = await Friendship.isFollowing(client && client._id, user._id)
    return ({
        ...user,
        following,
        followers_count,
        friends_count,
        statuses_count
    })
}
exports.serializeUsers = async (users = [], client) => {
    if (!users instanceof Array)
        throw Error("Unknown type")
    return Promise.all(users.map(user => this.serializeUser(user, client)))
}