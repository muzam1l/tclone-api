const mongoose = require('mongoose')
const assert = require('assert')
const User = require('../models/user.model')
const Post = require('../models/post.model')
const PostEngagement = require('../models/post_engagement.model')
const Notification = require('../models/notification.model')
const internal_setting = require('../models/internal_setting.model')
const home_timeline = require('../models/home_timeline.model')
const Hashtag = require('../models/hashtag.model')
const Trend = require('../models/trend.model')
const Auth = require('../models/auth.model')
const Friendship = require('../models/friendship.model')
/*
 * All models in project
 * Used to "pre populate" some posts fetched from Twitter api, Not anymore (ˉ﹃ˉ)
 * Now this file can be used for just bootstraping, like kicking off refreshTrends interval
 *
 * Though you can enable that in your own fork, just uncomment related sections
 * and paste timeline json in ./home_timeline.json
 */
// const dummy_timeline = require('./home_timeline.json')

async function pre_populate() {
    assert(mongoose.connection.readyState, 1, 'Database not connected')
    try {
        //Populate posts

        // const starterPromise = Promise.resolve(null)
        // await dummy_timeline.reduce(
        //     (p, post) => p.then(() => populatePost(post)),
        //     starterPromise
        // );

        //make a test user =test=
        // if (!await User.exists({ screen_name: 'test' })) {
        //     let user = await User.createNew({
        //         screen_name: 'test',
        //         name: 'test',
        //         description: "Test User whom password was taken by many :)...",
        //     }, { password: 'test' })
        // }
        // update trends

        /*
         * retaining it here even if it is only function in my repo
         */
        console.log('Skipped prepopulating!')
        await Trend.refreshTrends()
    } catch (error) {
        console.error('error populating:', error)
    } finally {
        let posts = await Post.countDocuments({})
        console.log('posts in db:', posts)
        let users = await User.countDocuments({})
        console.log('users in db:', users)
    }
}

// /**
//  *
//  * @param {any} post raw json to save post in db and parse for user, retweeted/quoted status and calls itself  recursively for embedded tweets
//  * @returns {Promise<Post>} post object in db
//  */
// async function populatePost(post) {
//     let user = await User.findOne({ id_str: post.user.id_str });
//     if (!user) {
//         user = await User.create(post.user);
//     }
//     post.user = user._id;
//     let { retweeted_status, quoted_status } = post
//     if (retweeted_status) {
//         let rs = await Post.findOne({ id_str: retweeted_status.id_str })
//         if (!rs)
//             rs = await populatePost(retweeted_status)
//         post.retweeted_status = rs._id
//     }
//     if (quoted_status) {
//         let qs = await Post.findOne({ id_str: quoted_status.id_str })
//         if (!qs)
//             qs = await populatePost(quoted_status)
//         post.quoted_status = qs._id
//     }
//     let pst = await Post.findOne({ id_str: post.id_str })
//     if (!pst) {
//         pst = await Post.create(post)
//     }
//     return pst
// }

module.exports = pre_populate
