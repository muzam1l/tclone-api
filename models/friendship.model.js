const mongoose = require('mongoose')

const friendshipSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    follower_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friend_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    liked_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
})
/**
 * checks if user1 is following user2
 * @param {*} user1_id 
 * @param {*} user2_id 
 */
friendshipSchema.statics.isFollowing = async function (user1_id = null, user2_id = null) {
    return this.exists({
        user_id: user1_id,
        friend_ids: user2_id
    })
}
/**
 * checks if user likes post
 * @param {*} user_id 
 * @param {*} post_id 
 */
friendshipSchema.statics.isLiked = async function (user_id = null, post_id = null) {
    return this.exists({
        user_id,
        liked_posts: post_id
    })
}
friendshipSchema.statics.likePost = async function (user_id = null, { post_id, postId }) {
    if (!post_id && postId)
        post_id = await mongoose.model("Post").findOne({ id_str: postId })
    let liked = await this.isLiked(user_id, post_id)
    if (liked)
        return ({ ok: 1, nModified: 0 })
    let res1 = await this.updateOne({ user_id }, {
        $push: { liked_posts: post_id }
    }, { upsert: true })
    if (res1.ok)
        await mongoose.model("Post").findByIdAndUpdate(post_id, {
            $inc: {
                favorite_count: 1
            }
        })
    return res1
}


module.exports = mongoose.model('Friendship', friendshipSchema)