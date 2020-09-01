const { Document } = require('mongoose')
const Friendship = require('../models/friendship')
/**
 * serializes user with fields required by client user
 */
exports.serializeUser = async (user, client = null) => {
    if (!user)
        return
    if (user instanceof Document)
        user = user.toObject()
    let following = await Friendship.isFollowing(client && client._id, user._id)
    return ({
        ...user,
        following
    })
}
exports.serializeUsers = async (users = [], client) => {
    if (users.toObject)
        users = users.toObject()
    if (!users instanceof Array)
        throw Error("Unknown type")
    return Promise.all(users.map(user => this.serializeUser(user, client)))
}
exports.serialisePost = async (post, client) => {
    if (!post)
        return
    if (post instanceof Document)
        post = post.toObject()
    if (!post.user)
        throw Error("Post doesnt have a user field")
    //serialise user field
    post.user = await this.serializeUser(post.user, client)
    //serialise post if necessary
    return ({
        ...post //no serialisation for now
    })
}
exports.serialisePosts = async (posts = [], client) => {
    if (posts.toObject)
        posts = posts.toObject()
    if (!posts instanceof Array)
        throw Error("Unknown type")
    return Promise.all(posts.map(post => this.serialisePost(post, client)))
}