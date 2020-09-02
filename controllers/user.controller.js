const User = require('../models/user.model')
const { serializeUser } = require('../serializers/user.serializer')
const { filterInput } = require('../utils/helpers')


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
exports.followUser = async (req, res, next) => {
    try {
        let username = req.params.username;
        username = filterInput(username, 'username');
        let user = await User.findOne({ screen_name: username }, '_id');
        if (!user)
            throw Error('username does not exist');
        let req_user = await User.findById(req.user._id);
        let responce = await req_user.follow(user._id);
        if (!responce.ok) {
            throw Error('user.follow responce not ok');
        }
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
        let responce = await req_user.unfollow(user._id);
        if (!responce.ok) {
            throw Error('user.unfollow responce not ok');
        }
        res.json({
            message: 'success'
        })
    } catch (err) {
        next(err)
    }
}