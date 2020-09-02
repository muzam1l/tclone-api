const mongoose = require('mongoose')
const assert = require('assert')
const User = require('../models/user.model')
const Post = require('../models/post.model')
const Trend = require('../models/trend.model')

const dummy_timeline = require('./home_timeline.json')
async function pre_populate() {
    assert(mongoose.connection.readyState, 1, 'Database not connected');
    try {
        //Populate posts
        let promises = await dummy_timeline.reduce(async (cumm, post) => {
            cumm = await cumm;
            let user = await User.findOne({ id: post.user.id });
            //this type of attitude to add non existent users should only exist in production or demos
            if (!user) {
                user = await User.create(post.user);
                //TODO add a timeline
            }
            post.user = user._id;
            if (!await Post.exists({ id: post.id })) {
                cumm.push(Post.create(post));
                return cumm;
            }
            return cumm
        }, Promise.resolve([]));
        await Promise.all(promises); //i thought it would take less time

        //make a test user =test=
        if (!await User.exists({ screen_name: 'test' })) {
            let user = await User.createNew({
                screen_name: 'test',
                name: 'test',
                description: "This user followes everybody, what a jerk...",
            }, { password: 'test' })
            //follow nobody
            // let tobe_friend_ids = await User.find({ screen_name: 'NASA' }, '_id');
            // list_tobe_friend_ids = tobe_friend_ids.map(obj => obj._id);
            // user.follow(...list_tobe_friend_ids); //await omitted
        }
        // update trends
        await Trend.refreshTrends();
    } catch (error) {
        console.error('error populating:', error)
    } finally {
        let posts = await Post.countDocuments({});
        console.log("posts in db:", posts);
        let users = await User.countDocuments({});
        console.log("users in db:", users);
    }
}
module.exports = pre_populate