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
const { ensureLoggedIn } = require('../middlewares')
const { filterInput } = require('../helpers')
/* GET home page. */
router.get('/home_timeline', ensureLoggedIn, async (req, res) => {
  try {
    assert(mongoose.connection.readyState, 1);
    let user = req.user;
    assert.ok(user);
    let page = req.query['p'];
    let posts = /*list*/await home_timeline.getTimeline({ user_id: user._id }, page);
    res.json({
      posts //posts: null or empty when exhausts
    })
  } catch (err) {
    console.error('error in /home_timeline')
    res.status(500).send("internel server error");
  }
});
/* POST create new post. */
router.post('/post', ensureLoggedIn, async (req, res) => {
  assert(mongoose.connection.readyState, 1);
  let user = req.user;
  assert.ok(user);
  try {
    let pst = await Post.addOne({ user_id: user._id }, req.body)
    res.status(200).json({
      'msg': 'post was succesfully added',
      'post': pst.populate('user').execPopulate(),
    });
  } catch (err) {
    console.error('error in /posts/new', err)
    res.status(500).send('internel server error')
  }
});

router.all('/follow/:username', ensureLoggedIn, async (req, res) => {
  try {
    let username = req.params.username;
    username = filterInput(username, 'username');
    console.log(username)
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
    //console.log('error in /follow/', err)
    res.status(400).json({
      message: 'user doesnt exist or bad request'
    })
  }
})

/* GET seach results */
router.get('/search', async (req, res) => {
  let query = req.query['q'];
  let page = req.query['p']
  if (parseInt(page) > 1) {
    res.json({ posts: null, done: true })
    return
  }
  if (!query) {
    res.json({
      posts: null
    })
    return
  }
  try {
    if (query.startsWith('#')) {
      // posts containing hashtag
      let result = await Post.searchHashtag(query);
      //result direct return of find (empty array when no match)
      res.json({ posts: result });
      return;
    }
    else if (query.startsWith('@')) {
      // posts containing @query or accounts matching query
      let posts = await Post.searchUserMention(query);
      let users = await User.searchUser(query);
      res.json({
        posts,
        users
      })
      return;
    }
    else {
      //do a text search
      let result = await Post.searchText(query);
      //result is direct return of find()
      res.json({ posts: result });
    }
  } catch (err) {
    console.log('error in /search:', err)
    res.status(500).send('internal server error')
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
    res.status(500).send('Internal server error');
  }
})

/* GET user Suggestions */
router.get('/users', ensureLoggedIn, async (req, res) => {
  let user = req.user;
  assert.ok(user)
  try {
    let result = await User.getSuggestions({ user_id: user._id });
    res.json({
      users: result,
      more: false
    })
  } catch (err) {
    console.log('error in /users', err);
    res.status(500).send('Internal server error')
  }
})

module.exports = router;