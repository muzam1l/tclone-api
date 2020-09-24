var express = require('express');
var router = express.Router();

const { ensureLoggedIn } = require('../utils/middlewares')

const { createPost,
    getPost,
    likePost,
    unlikePost,
    repostPost,
    unrepostPost,
    getLikes,
    getReposts,
    replyToPost,
    getReplies
} = require('../controllers/post.controller')
const { getUser, followUser, unFollowUser, updateUser, getFollowers, getFriends } = require('../controllers/user.controller')
const { homeTimeline, userTimeline } = require('../controllers/timeline.controller')
const { search, trends, userSuggests } = require('../controllers/search.controller')
const { notificationRead, getNotifications, subscribeDevice, unsubscribeDevice } = require('../controllers/notifications.controller')

/* GET notification read*/
router.get('/notification_read/:_id', ensureLoggedIn, notificationRead)
/* GET all notifications */
router.get('/notifications', ensureLoggedIn, getNotifications)
/* push subscribe, unsubscribe */
router.post('/notifications/subscribe', ensureLoggedIn, subscribeDevice);
router.get('/notifications/unsubscribe', ensureLoggedIn, unsubscribeDevice);

/* GET home page. */
router.get('/home_timeline', ensureLoggedIn, homeTimeline);
/* GET user timeline */
router.get('/user_timeline/:username', userTimeline)
/* GET user friends and followers */
router.get('/followers/:username', getFollowers)
router.get('/friends/:username', getFriends)

/* POST post a reply */
router.post('/post/:postId/reply', ensureLoggedIn, replyToPost)

/* GET Post liked_by and reposted_by */
router.get('/post/:postId/likes', getLikes);
router.get('/post/:postId/reposts', getReposts);

/* GET Post replies */
router.get('/post/:postId/replies', getReplies);

/* POST create new post. */
router.post('/post', ensureLoggedIn, createPost);

/* POST repost a post. */
router.post('/repost', ensureLoggedIn, repostPost);
/* POST unrepost a post. */
router.post('/unrepost', ensureLoggedIn, unrepostPost);
/* GET get a single post. */
router.get('/post/:postId', getPost);
router.all('/like/:postId', ensureLoggedIn, likePost);
router.all('/unlike/:postId', ensureLoggedIn, unlikePost);


/* GET get a single user detail. */
router.get('/user/:username', getUser);
router.all('/follow/:username', ensureLoggedIn, followUser);
router.all('/unfollow/:username', ensureLoggedIn, unFollowUser);
/* POST update authenticated user */
router.post('/updateuser', ensureLoggedIn, updateUser);

/* GET seach results */
router.get('/search', search)
/* GET trends. */
router.get('/trends', trends)
/* GET user Suggestions */
router.get('/users', ensureLoggedIn, userSuggests)

module.exports = router;