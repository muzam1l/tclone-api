var express = require('express');
var router = express.Router();
var { io } = require('../socketApi')
const mongoose = require('mongoose');
const assert = require('assert');

const home_timeline = require('../models/home_timeline')
const Post = require('../models/post')
const Trend = require('../models/trend')
const User = require('../models/user')
const passport = require('passport')
const { ensureLoggedIn } = require('../utils/middlewares')
const { filterInput } = require('../utils/helpers')
const {
  serialisePosts,
  serialisePost,
  serializeUser,
  serializeUsers
} = require('../utils/serializers')
/* GET home page. */
router.get('/home_timeline', ensureLoggedIn, async (req, res) => {
  try {
    assert(mongoose.connection.readyState, 1);
    let user = req.user;
    assert.ok(user);
    let page = req.query['p'];
    let posts = /*list*/await home_timeline.getTimeline({ user_id: user._id }, page);
    posts = await serialisePosts(posts, req.user)
    res.json({
      posts //posts: null or empty when exhausts
    })
  } catch (err) {
    console.error('error in /home_timeline', err)
    res.status(500).send("internel server error");
  }
});
/* POST create new post. */
router.post('/post', ensureLoggedIn, async (req, res) => {
  assert(mongoose.connection.readyState, 1);
  let user = req.user;
  assert.ok(user);
  try {
    let post = await Post.addOne({ user_id: user._id }, req.body)
    post = await pst.populate('user').execPopulate()
    post = await serialisePost(post, req.user)
    res.status(200).json({
      'msg': 'post was succesfully added',
      post
    });
  } catch (err) {
    console.error('error in /posts/new', err)
    res.status(500).send('internel server error')
  }
});

/* GET get a single post. */
router.get('/post/:postId', async (req, res) => {
  let postId = req.params.postId;
  let user = req.user;
  try {
    let post = await Post.findOne({ id_str: postId })
    if (!post) {
      res.status(400).json({ msg: "Bad request" })
      return
    }
    post = await post.populate('user').execPopulate()
    post = await serialisePost(post, req.user)
    res.status(200).json({
      post
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Something went wrong' })
  }
});
/* GET get a single user detail. */
router.get('/user/:username', async (req, res) => {
  let username = req.params.username;
  try {
    username = filterInput(username, 'username');
    let user = await User.findOne({ screen_name: username })
    user = await serializeUser(post, req.user)
    res.status(200).json({
      user
    });
  } catch (err) {
    res.status(500).json({ msg: 'Something went wrong' })
  }
});

router.all('/follow/:username', ensureLoggedIn, async (req, res) => {
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
    console.log('error in /follow/', err)
    res.status(400).json({
      message: 'bad request'
    })
  }
})
router.all('/unfollow/:username', ensureLoggedIn, async (req, res) => {
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
    console.log('error in /unfollow/', err)
    res.status(400).json({
      message: 'bad request'
    })
  }
})
/* GET user timeline */
router.get('/user_timeline/:username', async (req, res) => {
  let page = req.query['p'];
  let username = req.params.username;
  try {
    page = parseInt(page);
    username = filterInput(username, 'username');
    let user = await User.findOne({ screen_name: username })
    if (!user) {
      res.status(400).json({ message: "Bad request" })
      return
    }
    let posts = await Post.getUserTimeline({ user_id: user._id }, page)
    posts = await serialisePosts(posts, req.user)
    user = await serializeUser(user, req.user)
    res.json({
      posts,
      user
    })
  } catch (err) {
    console.log('error in /user_timeline: ', err)
    res.status(500).json({ msg: "Something went wrong" })
  }
})

/* GET seach results */
router.get('/search', async (req, res) => {
  let query = req.query['q'];
  let page = req.query['p'];
  if (!query) {
    res.json({
      posts: null
    })
    return
  }
  try {
    page = parseInt(page);
    if (query.startsWith('#')) {
      // posts containing hashtag
      let result = await Post.searchHashtag(query, page);
      //result direct return of find (empty array when no match)
      posts = await serialisePosts(result, req.user)
      res.json({ posts });
      return;
    }
    else if (query.startsWith('@')) {
      // posts containing @query or accounts matching query
      let posts = await Post.searchUserMention(query, page);
      let users = await User.searchUser(query);
      posts = await serialisePosts(posts, req.user)
      users = await serialisePost(users, req.user)
      res.json({
        posts,
        users
      })
      return;
    }
    else {
      //do a text search
      let result = await Post.searchText(query, page);
      //result is direct return of find()
      posts = await serialisePosts(result, req.user)
      res.json({ posts });
    }
  } catch (err) {
    console.log('error in /search:', err)
    res.status(500).json({ msg: "Something went wrong" })
  }
})

/* GET trends. */
router.get('/trends', async (req, res) => {
  let woeid = req.query['woeid'];
  try {
    let trend = await Trend.findOne({ 'locations.woeid': woeid });
    res.json(trend);

  } catch (error) {
    console.log('error in /trends', error);
    res.status(500).json({ msg: "Something went wrong" })
  }
})

/* GET user Suggestions */
router.get('/users', ensureLoggedIn, async (req, res) => {
  let user = req.user;
  assert.ok(user)
  try {
    let users = await User.getSuggestions({ user_id: user._id });
    users = await serializeUsers(users, req.user)
    res.json({
      users,
      more: false
    })
  } catch (err) {
    console.log('error in /users', err);
    res.status(500).json({ msg: "Something went wrong" })
  }
})

module.exports = router;