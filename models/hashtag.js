const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
    name: String,
    tweet_volume: {
        type: Number,
        default: 0
    }
})
module.exports = mongoose.model('Hashtag', hashtagSchema)