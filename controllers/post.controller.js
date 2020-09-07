const Post = require('../models/post.model')
const Friendship = require('../models/friendship.model')
const { serializePost } = require('../serializers/post.serializer')
const assert = require('assert')
const { post } = require('../routes/api')

exports.createPost = async (req, res, next) => {
    try {
        let user = req.user;
        let body = req.body;
        assert.ok(body)
        let post = await Post.addOne({ user_id: user._id }, body)
        post = await serializePost(post, req.user)
        res.status(200).json({
            'msg': 'post was succesfully added',
            post
        });
    } catch (err) {
        next(err)
    }
}
exports.getPost = async (req, res, next) => {
    try {
        let postId = req.params.postId;
        let post = await Post.findOne({ id_str: postId })
        if (!post) {
            res.status(400).json({ msg: "Bad request" })
            return
        }
        post = await serializePost(post, req.user)
        res.status(200).json({
            post
        });
    } catch (err) { next(err) }
}
exports.likePost = async (req, res, next) => {
    try {
        let postId = req.params.postId;
        let user = req.user;
        let responce = await Friendship.postLiked(user._id, { postId })
        if (responce.ok)
            res.json({ message: "Post was liked" })
        else
            throw Error("Error in like post")
    } catch (err) {
        next(err)
    }
}
exports.unlikePost = async (req, res, next) => {
    try {
        let postId = req.params.postId;
        let user = req.user;
        let responce = await Friendship.postUnliked(user._id, { postId })
        if (responce.ok)
            res.json({ message: "Post was unliked" })
        else
            throw Error("Error in unlike post")
    } catch (err) {
        next(err)
    }
}
exports.repostPost = async (req, res, next) => {
    try {
        let post = req.body;
        assert.ok(post)
        let form = {
            text: `RT @${post.user.screen_name}: ${post.text.slice(0, 50)}`,
            retweeted_status: post._id
        }
        let user = req.user;
        await Post.addOne({ user_id: user._id }, form)
        await Friendship.postReposted(user._id, { postId: post.id_str })
        res.json({
            message: "Successfully reposted"
        })
    } catch (err) {
        next(err)
    }
}
// exports.unrepostPost = async (req, res, next) => {
//     try {
//         let post = req.body;
//         let user = req.user;
//         assert.ok(user)
//         await Post.findOneAndDelete({ retweeted_status: post._id })
//         await Friendship.postUnreposted(user._id, { post_id: post._id })
//         res.json({
//             message: "Succesfully Unreposted"
//         })
//     } catch (err) {
//         next(err)
//     }
// }
