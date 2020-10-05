const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const internal_setting = require('./internal_setting.model')
const User = require('./user.model')
const Hashtag = require('./hashtag.model')
const home_timeline = require('./home_timeline.model')
const Notification = require('./notification.model')

const postSchema = mongoose.Schema({
    "created_at": { type: Date, default: Date.now },   //"Thu Apr 30 12:11:23 +0000 2020",
    "id": { type: mongoose.Schema.Types.Long, unique: true },
    "id_str": { type: String, unique: true },
    "text": {
        type: String,
        index: 'text',
        required: true
    },
    "source": String,
    "truncated": { type: Boolean, default: false },
    "in_reply_to_status_id": { type: mongoose.Schema.Types.Long, default: null },
    "in_reply_to_status_id_str": { type: String, default: null },
    "in_reply_to_user_id": { type: mongoose.Schema.Types.Long, default: null },
    "in_reply_to_user_id_str": { type: String, default: null },
    "in_reply_to_screen_name": { type: String, default: null },
    "user": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    "entities": {
        "hashtags": [{
            type: Object,
            index: true,
        }],
        "symbols": [{}],
        "user_mentions": [{}],
        "urls": [{}],
        "media": [{}]
    },
    "extended_entities": {
        "media": [{}]
    },
    "geo": {}, //N/I
    "coordinates": {}, //N/I
    "place": {}, //N/I
    "contributors": {}, //N/I

    "is_quote_status": { type: Boolean, default: false },
    "quoted_status_id": { type: mongoose.Schema.Types.Long },
    "quoted_status_id_str": { type: String },
    "quoted_status": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    "retweeted_status": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },

    "retweet_count": { type: Number, default: 0 },
    "favorite_count": { type: Number, default: 0 },
    "reply_count": { type: Number, default: 0 },

    //for personalised post objects (serialized)
    "favorited": { type: Boolean, default: false },
    "retweeted": { type: Boolean, default: false },
    "lang": { type: String, default: null }
}, { id: false })
let sPage = 15
/**
* addes a post for specific user
* @param {String} username - screen_name of user
* @param {Object} post - post body (partial) to add, must-have feilds: text, ...
* @returns {Promise} -  One returned by mongoose
*/
postSchema.statics.addOne = async function ({
    username: screen_name = null,
    user_id = null
}, post) {

    if (!user_id) {
        let { _id } = await User.findOne({ screen_name }, '_id');
        user_id = _id;
    }
    let id = await post_genId();
    return mongoose.model('Post').create({
        ...post,
        user: user_id,
        id: id,
        id_str: id.toString()
    })
}
postSchema.statics.searchHashtag = async function (query, page = 1) {
    page = parseInt(page);
    if (query.startsWith('#'))
        query = query.slice(1)
    return this.find({ 'entities.hashtags.text': query })
        .collation({
            locale: 'en',
            strength: 2
        })
        .sort('-created_at')
        .skip(sPage * (page - 1))
        .limit(sPage)
}
postSchema.statics.searchUserMention = async function (query, page = 1) {
    page = parseInt(page);
    if (query.startsWith('@'))
        query = query.slice(1);
    return this.find({
        $or: [
            { 'entities.user_mentions.screen_name': query },
            { 'entities.user_mentions.name': query }
        ]
    }).collation({
        locale: 'en',
        strength: 2
    }).sort('-created_at')
        .skip(sPage * (page - 1))
        .limit(sPage)
}
postSchema.statics.searchText = async function (query, page = 1) {
    page = parseInt(page);
    return this.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: 'textScore' } })
        .skip(sPage * (page - 1))
        .limit(sPage)
}
postSchema.statics.getUserTimeline = async function ({
    username: screen_name = null,
    user_id = null
}, page = 1) {
    if (!user_id) {
        let { _id } = await mongoose.model("User").findOne({ screen_name: screen_name }, "_id")
        if (!_id)
            throw Error('Cannot find User')
        user_id = _id
    }
    return this.find({
        user: user_id
    }).sort("-created_at")
        .skip(sPage * (page - 1))
        .limit(sPage)
}

async function post_genId() {
    /**
    * generates simple incrementing value
    * last value alotted is stored in internals collection as last_id_allotted
    */
    await internal_setting.updateOne({ ver: '1.0' }, {
        $inc: { current_post_id: 1 }
    }, { upsert: true })
    let { current_post_id } = await internal_setting.findOne({ ver: '1.0' }, 'current_post_id');
    return current_post_id;
}
postSchema.post('save', async (doc, next) => {

    //update statuses_count in User
    await mongoose.model('User').findOneAndUpdate({ _id: doc.user }, {
        $inc: { statuses_count: 1 }
    });
    // update timeline of followers, and itself
    let quer = await mongoose.model('Friendship').findOne({ user_id: doc.user }, 'follower_ids');
    if (quer) {
        await mongoose.model('home_timeline')
            .bulkAddPosts(quer.follower_ids.concat(doc.user), { id_post_added: doc._id });
    }
    let entities = { hashtags: [], user_mentions: [] };
    try {
        // parse post
        if (doc.entities.hashtags.length === 0 && doc.entities.user_mentions.length === 0) {
            let text = doc.text;
            /* Fix
            * Ignore retweets having syntax, RT @username: 
            */
            if (text.startsWith('RT @'))
                text = ''

            // Parse #hastag
            let hashes = text.matchAll(/#(\w|_)+/gi);
            for (let match of hashes) {
                entities.hashtags.push({
                    text: match[0].slice(1),
                    indices: [match.index, match[0].length]
                });
            }
            // parse username
            let mentions = text.matchAll(/@(\w|_)+/gi);
            for (let match of mentions) {
                let screen_name = match[0].slice(1);
                let user = await User.findOne({ screen_name });
                entities.user_mentions.push({
                    screen_name: screen_name,
                    indices: [match.index, match[0].length],
                    name: user ? user.name : undefined,
                    id: user ? user.id : undefined,
                    id_str: user ? user.id_str : undefined,
                })
            }
            await mongoose.model('Post').updateOne({ _id: doc._id }, {
                $set: { entities: entities },
            })
        }
        else {
            entities = doc.entities;
        }
    } catch (err) {
        console.log('parsing error:', err)
    }
    // add to timeline of mentioned users
    entities.user_mentions.forEach(async mention => {
        if (!mention.id)
            return
        let user = await User.findOne({ id: mention.id }, '_id');
        if (user) {
            await home_timeline.bulkAddPosts([user._id], { id_post_added: doc._id });

            await Notification.push(user._id, {
                type: 'mentioned',
                title: `You were mentioned by @${doc.user.screen_name}`,
                body: {
                    user: doc.user._id,
                    post: doc._id
                }
            })
        }
    })
    // put hashtag to trends (hashtag collection actually)
    let names = entities.hashtags.map(obj => obj.text);
    names.forEach(async name => {
        let res = await Hashtag.updateOne({ name: '#' + name }, {
            $inc: { tweet_volume: 1 }
        }, { upsert: true });
    });
});
postSchema.pre('deleteMany', { document: true, query: true }, next => {
    next(new Error('deletemany is not configured yet, use deleteOne instead'));
});
postSchema.pre('deleteOne', { document: false, query: true }, next => {
    next(new Error('deleteOne on query is not configured yet, use deleteOne on Doc instead'));
});
/** QUERY middleware */
postSchema.post('deleteOne', { document: true, query: false }, async doc => {
    try {
        //update statuses_count in User
        // await mongoose.model('User').findOneAndUpdate({ _id: doc.user }, {
        //     $inc: { statuses_count: 1 }
        // });
        // update  follower's and itself's timeline,
        let quer = await mongoose.model('Friendship').findOne({ user_id: doc.user }, 'follower_ids');
        if (quer) {
            await mongoose.model('home_timeline')
                .bulkRemovePosts(quer.follower_ids.concat(doc.user), { id_post_removed: doc._id });
        }
        // update timeline of mentioned users
        let { entities: { user_mentions = [], hashtags = [] } = {} } = doc;
        user_mentions.forEach(async mention => {
            if (!mention)
                return
            let user = await User.findOne({ id: mention.id }, '_id');
            if (user) {
                await home_timeline.bulkRemovePosts([user._id], { id_post_removed: doc._id });
            }
        })
        // update trends (hashtag collection actually)
        let names = hashtags.map(obj => obj.text);
        names.forEach(async name => {
            await Hashtag.updateOne({ name: '#' + name }, {
                $inc: { tweet_volume: -1 }
            });
        });
    } catch (err) {
        console.log(err)
        throw err
    }
});

module.exports = mongoose.model('Post', postSchema);