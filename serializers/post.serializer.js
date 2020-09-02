const { Document } = require('mongoose')
const Friendship = require('../models/friendship.model')
const { serializeUser } = require('./user.serializer')

exports.serializePost = async (post, client) => {
    if (!post)
        return
    if (post instanceof Document)
        post = post.toObject()
    //serialize user field
    if (!post.user)
        throw Error("Post doesnt have a user field")
    post.user = await serializeUser(post.user, client)
    if (!client)
        return post
    //serialize post if necessary
    let favorited = await Friendship.isLiked(client._id, post._id)
    return ({
        ...post,
        favorited
    })
}
exports.serializePosts = async (posts = [], client) => {
    if (posts.toObject)
        posts = posts.toObject()
    if (!posts instanceof Array)
        throw Error("Unknown type")
    return Promise.all(posts.map(post => this.serializePost(post, client)))
}