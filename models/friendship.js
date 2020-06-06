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
module.exports = mongoose.model('Friendship', friendshipSchema)