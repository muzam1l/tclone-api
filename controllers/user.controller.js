const User = require('../models/user.model')
const Friendship = require('../models/friendship.model')
const { serializeUser } = require('../serializers/user.serializer')
const { filterInput } = require('../utils/helpers')
const assert = require('assert')

exports.getUser = async (req, res, next) => {
    try {
        let username = req.params.username;
        username = filterInput(username, 'username');
        let user = await User.findOne({ screen_name: username })
        user = await serializeUser(post, req.user)
        res.status(200).json({
            user
        });
    } catch (err) {
        next(err)
    }
}
exports.updateUser = async (req, res, next) => {
    try {
        let user = req.user
        assert.ok(user)
        let { name, description, profile_banner_color, location, website, profile_image_url_https } = req.body
        let url = {
            url: website,
            expanded_url: website,
        }
        user = await User.findByIdAndUpdate(user._id, {
            $set: {
                name,
                description,
                profile_image_url_https,
                profile_banner_color,
                location,
                default_profile_image: false,
                default_profile: false,
                'entities.url.urls': [url]
            },
        }, { new: true })
        if (user) {
            user = await serializeUser(user, user)
            res.json({ user })
        }
        else
            throw Error('error in updateUser')
    } catch (err) {
        next(err)
    }
}

exports.followUser = async (req, res, next) => {
    try {
        let username = req.params.username;
        username = filterInput(username, 'username');
        let user = await User.findOne({ screen_name: username }, '_id');
        if (!user)
            throw Error('username does not exist');
        let req_user = await User.findById(req.user._id);
        let responce = await Friendship.gotFollowed(user._id, req_user._id)
        if (responce.ok && responce.nModified !== 0)
            await req_user.follow(user._id);
        else
            throw Error('user.follow responce not ok');

        res.json({
            message: 'success'
        })
    } catch (err) {
        next(err)
    }
}
exports.unFollowUser = async (req, res, next) => {
    try {
        let username = req.params.username;
        username = filterInput(username, 'username');
        let user = await User.findOne({ screen_name: username }, '_id');
        if (!user)
            throw Error('username does not exist');
        let req_user = await User.findById(req.user._id);
        let responce = await Friendship.gotUnfollowed(user._id, req_user._id)
        // if (responce.ok && responce.nModified !== 0)
        await req_user.unfollow(user._id);
        // else
        // throw Error('user.unfollow responce not ok');
        res.json({
            message: 'success'
        })
    } catch (err) {
        next(err)
    }
}