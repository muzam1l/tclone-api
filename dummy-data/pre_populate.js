const mongoose = require('mongoose')
const assert = require('assert')
const User = require('../models/user.model')
const Post = require('../models/post.model')
const Trend = require('../models/trend.model')

const dummy_timeline = require('./home_timeline.json')

/**
 * 
 * @param {any} post raw json to save post in db and parse for user, retweeted/quoted status and calls itself  recursively for embedded tweets
 * @returns {Promise<Post>} post object in db
 */
let populatePost = async post => {
    let user = await User.findOne({ id_str: post.user.id_str });
    if (!user) {
        user = await User.create(post.user);
    }
    post.user = user._id;
    let { retweeted_status, quoted_status } = post
    if (retweeted_status) {
        let rs = await Post.findOne({ id_str: retweeted_status.id_str })
        if (!rs)
            rs = await populatePost(retweeted_status)
        post.retweeted_status = rs._id
    }
    if (quoted_status) {
        let qs = await Post.findOne({ id_str: quoted_status.id_str })
        if (!qs)
            qs = await populatePost(quoted_status)
        post.quoted_status = qs._id
    }
    let pst = await Post.findOne({ id_str: post.id_str })
    if (!pst) {
        pst = await Post.create(post)
    }
    return pst
}

async function pre_populate() {
    assert(mongoose.connection.readyState, 1, 'Database not connected');
    try {
        //Populate posts
        // dummy_timeline.forEach(populatePost) CALLS PARALLELY SO DUPLICATE KEY EXCEPTIONS ALL AROUND
        const starterPromise = Promise.resolve(null)
        await dummy_timeline.reduce(
            (p, post) => p.then(() => populatePost(post)),
            starterPromise
        );

        //make a test user =test=
        if (!await User.exists({ screen_name: 'test' })) {
            let user = await User.createNew({
                screen_name: 'test',
                name: 'test',
                description: "Test User whom password was taken by many :)...",
            }, { password: 'test' })
            //follow nobody
            /* deprecated pratice 
            * let tobe_friend_ids = await User.find({ screen_name: 'NASA' }, '_id');
            * list_tobe_friend_ids = tobe_friend_ids.map(obj => obj._id);
            * await user.follow(...list_tobe_friend_ids);
            */
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