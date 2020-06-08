const mongoose = require('mongoose');

const trendSchema = mongoose.Schema({
    trends: [{
        name: {
            type: String,
            required: true,
        },
        url: String,
        promoted_content: {
            type: String,
            default: null
        },
        query: String,
        tweet_volume: Number
    }],
    as_of: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    locations: [{
        name: String,
        woeid: {
            type: Number,
            required: true
        }
    }]
})
module.exports = mongoose.model('Trend', trendSchema)