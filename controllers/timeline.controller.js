const mongoose = require('mongoose')
const home_timeline = require('../models/home_timeline.model')
const Post = require('../models/post.model')
const User = require('../models/user.model')
const { serializePosts } = require('../serializers/post.serializer')
const { serializeUser } = require('../serializers/user.serializer')
const { filterInput } = require('../utils/helpers')
const assert = require('assert')

exports.homeTimeline = async (req, res, next) => {
    try {
        assert(mongoose.connection.readyState, 1);
        let user = req.user;
        assert.ok(user);
        let page = req.query['p'];
        let posts = /*list*/await home_timeline.getTimeline({ user_id: user._id }, page);
        posts = await serializePosts(posts, req.user)
        res.json({
            posts //posts: null or empty when exhausts
        })
    } catch (err) {
        next(err)
    }
}
exports.userTimeline = async (req, res, next) => {
    try {
        let username = req.params.username;
        let page = req.query['p'];
        page = parseInt(page);
        username = filterInput(username, 'username');
        let user = await User.findOne({ screen_name: username })
        if (!user) {
            res.status(400).json({ message: "Bad request" })
            return
        }
        let posts = await Post.getUserTimeline({ user_id: user._id }, page)
        posts = await serializePosts(posts, req.user)
        user = await serializeUser(user, req.user)
        res.json({
            posts,
            user
        })
    } catch (err) {
        next(err)
    }
}