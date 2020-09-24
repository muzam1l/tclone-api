const mongoose = require('mongoose')
const Notification = require('./notification.model')

const engageSchema = mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    liked_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reposted_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reply_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
})
engageSchema.statics.gotLiked = async function (post_id, user_id) {
    if (await this.exists({ post_id, liked_by: user_id }))
        return
    const post = await mongoose.model('Post').findById(post_id)
    await post.updateOne({
        $inc: {
            favorite_count: 1
        }
    })
    await Notification.push(post.user, { //user is not populated
        type: 'liked',
        title: 'You got a  like',
        body: {
            post: post_id, // post which was liked
            user: user_id //user who liked
        }
    })
    return this.updateOne({ post_id }, {
        $push: {
            liked_by: {
                $each: [user_id],
                $position: 0
            }
        }
    }, { upsert: true })
}
engageSchema.statics.gotUnliked = async function (post_id, user_id) {
    if (!await this.exists({ post_id, liked_by: user_id }))
        return
    await mongoose.model('Post').updateOne({ _id: post_id }, {
        $inc: {
            favorite_count: -1
        }
    })
    return this.updateOne({ post_id }, {
        $pull: {
            liked_by: user_id
        }
    })
}
engageSchema.statics.gotReposted = async function (post_id, user_id) {
    if (await this.exists({ post_id, reposted_by: user_id }))
        return
    const post = await mongoose.model('Post').findById(post_id)
    await post.updateOne({
        $inc: {
            retweet_count: 1
        }
    })
    await Notification.push(post.user, { //user is not populated
        type: 'reposted',
        title: 'Your post was reposted',
        body: {
            post: post_id, // post which was reposted
            user: user_id //user who reposted
        }
    })
    return this.updateOne({ post_id }, {
        $push: {
            reposted_by: {
                $each: [user_id],
                $position: 0
            }
        }
    }, { upsert: true })
}
engageSchema.statics.gotUnreposted = async function (post_id, user_id) {
    if (!await this.exists({ post_id, reposted_by: user_id }))
        return
    await mongoose.model('Post').updateOne({ _id: post_id }, {
        $inc: {
            retweet_count: -1
        }
    })
    return this.updateOne({ post_id }, {
        $pull: {
            reposted_by: user_id
        }
    })
}
engageSchema.statics.gotReplied = async function (post_id, reply_post_id) {
    if (await this.exists({ post_id, reply_posts: reply_post_id }))
        return
    const post = await mongoose.model('Post').findById(post_id)
    await Notification.push(post.user, { //user is not populated
        type: 'replied',
        title: 'You got a reply',
        body: {
            post: reply_post_id, // reply post
        }
    })
    return this.updateOne({ post_id }, {
        $push: {
            reply_posts: {
                $each: [reply_post_id],
                $position: 0
            }
        }
    }, { upsert: true })
}

module.exports = mongoose.model('PostEngagement', engageSchema)