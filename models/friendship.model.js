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
    reposted_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
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
 * checks if user1 is being followed user2
 * @param {*} user1_id 
 * @param {*} user2_id 
 */
friendshipSchema.statics.isFollowed = async function (user1_id = null, user2_id = null) {
    return this.exists({
        user_id: user1_id,
        follower_ids: user2_id
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
friendshipSchema.statics.isReposted = async function (user_id = null, post_id = null) {
    return this.exists({
        user_id,
        reposted_ids: post_id
    })
}

friendshipSchema.statics.postLiked = async function (user_id = null, { post_id, postId }) {
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id")
        post_id = post._id;
    }
    else if (!post_id)
        throw Error('Cannot determine post')
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
friendshipSchema.statics.postUnliked = async function (user_id = null, { post_id, postId }) {
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id")
        post_id = post._id
    }
    else if (!post_id)
        throw Error('Cannot determine post')
    let liked = await this.isLiked(user_id, post_id)
    if (!liked)
        return ({ ok: 1, nModified: 0 })
    let res1 = await this.updateOne({ user_id }, {
        $pull: { liked_posts: post_id }
    })
    if (res1.ok)
        await mongoose.model("Post").findByIdAndUpdate(post_id, {
            $inc: {
                favorite_count: -1
            }
        })
    return res1
}
friendshipSchema.statics.postReposted = async function (user_id = null, { post_id, postId }) {
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id")
        post_id = post._id
    }
    else if (!post_id)
        throw Error('Cannot determine post')
    let reposted = await this.isReposted(user_id, post_id)
    if (reposted)
        return ({ ok: 1, nModified: 0 })
    let res1 = await this.updateOne({ user_id }, {
        $push: { reposted_ids: post_id }
    })
    if (res1.ok)
        await mongoose.model("Post").findByIdAndUpdate(post_id, {
            $inc: {
                retweet_count: 1
            }
        })
    return res1
}
friendshipSchema.statics.postUnreposted = async function (user_id = null, { post_id, postId }) {
    if (postId) {
        post = await mongoose.model("Post").findOne({ id_str: postId }, "_id")
        post_id = post._id
    }
    if (!post_id)
        throw Error('Cannot determine post')
    let reposted = await this.isReposted(user_id, post_id)
    if (!reposted)
        return ({ ok: 1, nModified: 0 })
    let res1 = await this.updateOne({ user_id }, {
        $pull: { reposted_ids: post_id }
    })
    if (res1.ok)
        await mongoose.model("Post").findByIdAndUpdate(post_id, {
            $inc: {
                retweet_count: -1
            }
        })
    return res1
}
/**
 * when user1 got followed by user2
 * @param {*} user1_id 
 * @param {*} user2_id 
 */
friendshipSchema.statics.gotFollowed = async function (user1_id = null, user2_id = null) {
    let follower = await this.isFollowed(user1_id, user2_id)
    if (follower) //already follower, skip(bug in front-end app)
        return ({ ok: 1, nModified: 0 })
    await mongoose.model('User').findByIdAndUpdate(user1_id, {
        $inc: { followers_count: 1 }
    })
    return this.updateOne({ user_id: user1_id }, {
        $push: { follower_ids: user2_id }
    }, { upsert: true })
}
/**
 * contrary to gotFollowed
 * when user1 got unfollowed by user2
 * @param {*} user1_id 
 * @param {*} user2_id 
 */
friendshipSchema.statics.gotUnfollowed = async function (user1_id = null, user2_id = null) {
    let follower = await this.isFollowed(user1_id, user2_id)
    if (!follower) //not a follower, skip. (bug in front-end app)
        return ({ ok: 1, nModified: 0 })
    await mongoose.model('User').findByIdAndUpdate(user1_id, {
        $inc: { followers_count: -1 }
    })
    return this.updateOne({ user_id: user1_id }, {
        $pull: { follower_ids: user2_id }
    })
}

module.exports = mongoose.model('Friendship', friendshipSchema)