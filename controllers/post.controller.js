const Post = require('../models/post.model')
const Friendship = require('../models/friendship.model')
const { serializePost } = require('../serializers/post.serializer')

exports.createPost = async (req, res, next) => {
    try {
        let user = req.user;
        let post = await Post.addOne({ user_id: user._id }, req.body)
        post = await post.populate('user').execPopulate()
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
        post = await post.populate('user').execPopulate()
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
        let responce = await Friendship.likePost(user._id, { postId })
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
        let responce = await Friendship.unlikePost(user._id, { postId })
        if (responce.ok)
            res.json({ message: "Post was unliked" })
        else
            throw Error("Error in unlike post")
    } catch (err) {
        next(err)
    }
}