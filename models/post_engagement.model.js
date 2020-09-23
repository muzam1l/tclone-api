const mongoose = require('mongoose')

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
    }]
})
engageSchema.statics.gotLiked = async function (post_id, user_id) {
    if (await this.exists({ post_id, liked_by: user_id }))
        return
    await mongoose.model('Post').updateOne({ _id: post_id }, {
        $inc: {
            favorite_count: 1
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
    await mongoose.model('Post').updateOne({ _id: post_id }, {
        $inc: {
            retweet_count: 1
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

module.exports = mongoose.model('PostEngagement', engageSchema)