/*
* Uses socket.io 2, make according changes for >3 if you want to enable that
------------------------------------------------------

const io = require('socket.io')({
    origins: '*:*'
});
const passport = require("passport")
const session = require("express-session");
const { core_ensureLoggedIn, sessionMiddleware } = require('./utils/middlewares');
const authNamespace = io.of('/auth');

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

authNamespace.use(wrap(sessionMiddleware));
authNamespace.use(wrap(passport.initialize()));
authNamespace.use(wrap(passport.session()));

authNamespace.use(wrap(async (req, _, next) => {
    try {
        await core_ensureLoggedIn(req, {}, next)
    } catch (err) {
        next(err)
    }
}));

authNamespace.on('connect', socket => {
    let { user } = socket.request
    // console.log("room exists?", !!authNamespace.adapter.rooms[user._id])
    socket.join(user._id, (err) => {
        // if (err) socket.disconnect()
    })
    // save socketId in session
    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();
});
const sendData = (type, user_id, data) => {
    let roomExists = !!authNamespace.adapter.rooms[user_id]
    if (!roomExists)
        authNamespace.adapter.add('null', user_id)
    authNamespace.to(user_id).emit(type, data)
}

const destroyAuthSession = socketId => {
    if (socketId && authNamespace.connected[socketId]) {
        console.log(`forcefully closing socket ${socketId}`);
        authNamespace.connected[socketId].disconnect(true);
    }
}
exports.sendData = sendData
exports.destroyAuthSession = destroyAuthSession;
exports.io = io;

*/