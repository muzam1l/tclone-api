const { Document } = require('mongoose')
const Friendship = require('../models/friendship.model')
const { serializeUser } = require('./user.serializer')

exports.serializePost = async (post, client) => {
    if (!post)
        return
    if (!post instanceof Document)
        throw Error('Unknown post type')
    post = await post
        .populate('user')
        .populate('retweeted_status')
        .populate('quoted_status')
        .execPopulate()

    //serialize embedded posts
    let retweeted_status = await this.serializePost(post.retweeted_status, client)
    let quoted_status = await this.serializePost(post.quoted_status, client)

    //serialize user field
    if (!post.user)
        throw Error("Post doesnt have a user field")
    let user = await serializeUser(post.user, client)

    post = post.toObject()
    if (!client)
        return post
    //serialize post if necessary
    let favorited = await Friendship.isLiked(client._id, post._id)
    let retweeted = await Friendship.isReposted(client._id, post._id)
    return ({
        ...post,
        favorited,
        retweeted,
        user,
        retweeted_status,
        quoted_status
    })
}
exports.serializePosts = async (posts = [], client) => {
    if (!posts instanceof Array) //includes CoreDocumentArray
        throw Error("Unknown type")
    return Promise.all(posts.map(post => this.serializePost(post, client)))
}