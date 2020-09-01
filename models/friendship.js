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
    }]
})
/**
 * checks if user1 is following user2
 * @param {*} user1_id 
 * @param {*} user2_id 
 */
friendshipSchema.statics.isFollowing = async function (user1_id, user2_id) {
    return this.exists({
        user_id: user1_id,
        friend_ids: user2_id
    })
}

module.exports = mongoose.model('Friendship', friendshipSchema)