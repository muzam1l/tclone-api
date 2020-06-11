const mongoose = require('mongoose')

const timelineSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    posts: [{
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        created_at: {
            type: Date,
        }
    }]
})
/**
 * @param {Object} first param is object with username or user_id to idetify user
 * @param {Number} page page no., 1 by defualt
 */
timelineSchema.statics.getTimeline = async ({
    username: screen_name = null,
    user_id = null
}, page = 1) => {
    let p = parseInt(page); //page/batch number
    const s = 20; //size of page/batch
    /**
     * s = 20
     * $slice -> [skip, size] in mongo
     * 1 --> [0, 20] | [s * (p - 1), s]  | would be [s * (p - 1), s * p] index based
     * 2 --> [20, 20]
     * 3 --> [40, 20]
     */
    if (!user_id) {
        let { _id } = await mongoose.model('User')
            .findOne({ screen_name }, '_id');
        user_id = _id;
    }
    let { posts } = await mongoose.model('home_timeline') //or this
        .findOne({ user_id },
            { posts: { $slice: [s * (p - 1), s] } }) //returns
        .populate({
            path: 'posts.post_id', //populates post
            populate: 'user' //populates user feild
        })
    posts = posts.map(obj => obj.post_id);
    return posts;
}

timelineSchema.statics.bulkAddPosts = async function (user_ids, ...args) {
    /**
     * calls <Document>.bulkAddPosts() of each user_id with remaining args
     * @param {Array} user_id - array of user._id's of concerned users
     */
    let timelines = await this.find({ user_id: { $in: user_ids } });
    timelines //forEach does parallelly (unlike for of)
        .forEach(timeline => timeline.bulkAddPosts(...args))
}
/**
 * bulkAddposts
 * 
* updates the timeline of user with posts from friends_added
* updates all posts if id_post_added not given
* @param {Object} _ id_of_post added or id_of_friend added
* @returns res - result of update command
*/
timelineSchema.methods.bulkAddPosts = async function ({
    id_friend_added = null,
    id_post_added = null
}) {
    let posts_toadd;
    if (id_friend_added) { //new friend add all posts
        posts_toadd = await mongoose.model('Post').find({
            user: id_friend_added,
            //TODO maybe limit posts when they are too many
        }, '_id created_at');
    }
    else if (id_post_added) { // add this post only
        posts_toadd = await mongoose.model('Post').find({
            _id: id_post_added
        }, '_id created_at');
    }
    posts_toadd = posts_toadd.map(obj => {
        let { _id: post_id, created_at } = obj;
        return {
            post_id,
            created_at
        }
    })
    let res = await this.update({
        $push: {
            posts: {
                $each: posts_toadd,
                $sort: { created_at: -1 }
            }
        }
    })
    return res;
}

module.exports = mongoose.model('home_timeline', timelineSchema)