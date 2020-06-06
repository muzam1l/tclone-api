var io = require('socket.io')();
io.on('connection', socket => {
    //console.log('a user connected', socket.id);
    socket.on('identification', data => {
        socket.join(data.id);
    });
});

module.exports.io = io;