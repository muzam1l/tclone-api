const mongoose = require('mongoose');
require('mongoose-long')(mongoose)

/**
 * contains internal settings
 * more than one documents only in case of schema change, itentified by 'ver'
 */
const internalSchema = mongoose.Schema({
    ver: {
        type: String,
        default: '1.0'
    },
    current_post_id: {
        type: mongoose.Schema.Types.Long,
        default: 0
    },
    current_user_id: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('internal_setting', internalSchema) 