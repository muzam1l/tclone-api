const User = require('../models/user.model')
const Friendship = require('../models/friendship.model')
const { serializeUser, serializeUsers } = require('../serializers/user.serializer')
const { filterInput, ensureCorrectImage } = require('../utils/helpers')
const assert = require('assert')

exports.getUser = async (req, res, next) => {
    try {
        let username = req.params.username
        username = filterInput(username, 'username')
        let user = await User.findOne({ screen_name: username })
        user = await serializeUser(user, req.user)
        res.status(200).json({
            user,
        })
    } catch (err) {
        next(err)
    }
}
exports.updateUser = async (req, res, next) => {
    try {
        let user = req.user
        assert.ok(user)
        let {
            name,
            description,
            profile_banner_color,
            location,
            website,
            profile_image_url_https,
        } = req.body

        name = filterInput(name, 'name', { identifier: 'Name' })
        description = filterInput(description, 'html', { max_length: 200, identifier: 'Bio' })
        profile_banner_color = filterInput(profile_banner_color, null, {
            regex: /^#[0-9A-Fa-f]{3,6}$/,
            identifier: 'Banner color',
        })
        location = filterInput(location, 'name', { min_length: 0, identifier: 'Location' })
        website = filterInput(website, 'html', { min_length: 0, identifier: 'Website URL' })
        profile_image_url_https = ensureCorrectImage(profile_image_url_https)

        let url = {
            url: website,
            expanded_url: website,
        }
        user = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    name,
                    description,
                    profile_image_url_https,
                    profile_banner_color,
                    location,
                    default_profile_image: false,
                    default_profile: false,
                    'entities.url.urls': [url],
                },
            },
            { new: true }
        )
        if (user) {
            user = await serializeUser(user, user)
            res.json({ user })
        } else throw Error('error in updateUser')
    } catch (err) {
        next(err)
    }
}

exports.followUser = async (req, res, next) => {
    try {
        let username = req.params.username
        username = filterInput(username, 'username')
        let user = await User.findOne({ screen_name: username }, '_id')
        if (!user) throw Error('username does not exist')
        let req_user = await User.findById(req.user._id)
        let responce = await Friendship.gotFollowed(user._id, req_user._id)
        if (responce.ok && responce.nModified !== 0) await req_user.follow(user._id)
        else throw Error('user.follow responce not ok')

        res.json({
            message: 'success',
        })
    } catch (err) {
        next(err)
    }
}
exports.unFollowUser = async (req, res, next) => {
    try {
        let username = req.params.username
        username = filterInput(username, 'username')
        let user = await User.findOne({ screen_name: username }, '_id')
        if (!user) throw Error('username does not exist')
        let req_user = await User.findById(req.user._id)
        let responce = await Friendship.gotUnfollowed(user._id, req_user._id)
        // if (responce.ok && responce.nModified !== 0)
        await req_user.unfollow(user._id)
        // else
        // throw Error('user.unfollow responce not ok');
        res.json({
            message: 'success',
        })
    } catch (err) {
        next(err)
    }
}
exports.getFollowers = async (req, res, next) => {
    try {
        let username = req.params.username
        username = filterInput(username, 'username')
        const p = parseInt(req.query['p']) //page/batch number
        const s = 20 //size of page/batch

        const user = await User.findOne({ screen_name: username }, '_id')
        if (!user) return res.status(400).json({ msg: 'Bad request' })

        const doc = await Friendship.findOne(
            { user_id: user._id },
            {
                follower_ids: {
                    $slice: [s * (p - 1), s],
                },
            }
        ).populate('follower_ids')
        if (!doc) return res.json({ users: null })
        const users = await serializeUsers(doc.follower_ids, user)
        res.json({ users: users })
    } catch (err) {
        next(err)
    }
}
exports.getFriends = async (req, res, next) => {
    try {
        let username = req.params.username
        username = filterInput(username, 'username')
        let p = req.query['p']
        p = parseInt(p) //page/batch number
        const s = 15 //size of page/batch

        const user = await User.findOne({ screen_name: username }, '_id')
        if (!user) return res.status(400).json({ msg: 'Bad request' })

        const doc = await Friendship.findOne(
            { user_id: user._id },
            {
                friend_ids: {
                    $slice: [s * (p - 1), s],
                },
            }
        ).populate('friend_ids')
        if (!doc) return res.json({ users: null })
        const users = await serializeUsers(doc.friend_ids, user)
        res.json({ users: users })
    } catch (err) {
        next(err)
    }
}
