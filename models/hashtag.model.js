const mongoose = require('mongoose')

const hashtagSchema = mongoose.Schema({
    name: String,
    tweet_volume: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    }
}, {
    timestamps:
        { createdAt: 'created_at', updatedAt: 'updated_at' }
})
module.exports = mongoose.model('Hashtag', hashtagSchema)