var express = require('express');
var router = express.Router();

const { ensureLoggedIn } = require('../utils/middlewares')

const { createPost, getPost, likePost, unlikePost, repostPost, unrepostPost } = require('../controllers/post.controller')
const { getUser, followUser, unFollowUser } = require('../controllers/user.controller')
const { homeTimeline, userTimeline } = require('../controllers/timeline.controller')
const { search, trends, userSuggests } = require('../controllers/search.controller')

/* GET home page. */
router.get('/home_timeline', ensureLoggedIn, homeTimeline);
/* GET user timeline */
router.get('/user_timeline/:username', userTimeline)


/* POST create new post. */
router.post('/post', ensureLoggedIn, createPost);
/* POST repost a post. */
router.post('/repost', ensureLoggedIn, repostPost);
/* POST unrepost a post. */
// router.post('/unrepost', ensureLoggedIn, unrepostPost);
/* GET get a single post. */
router.get('/post/:postId', getPost);
router.all('/like/:postId', ensureLoggedIn, likePost);
router.all('/unlike/:postId', ensureLoggedIn, unlikePost);


/* GET get a single user detail. */
router.get('/user/:username', getUser);
router.all('/follow/:username', ensureLoggedIn, followUser);
router.all('/unfollow/:username', ensureLoggedIn, unFollowUser);

/* GET seach results */
router.get('/search', search)
/* GET trends. */
router.get('/trends', trends)
/* GET user Suggestions */
router.get('/users', ensureLoggedIn, userSuggests)

module.exports = router;