const User = require('../models/user')

function ensureLoggedIn(req, res, next) {
    let user = req.user;
    if (!user) { //not logged in
        res.status(401).json({ msg: 'login required' })
        return
    }
    // extra check
    // if (!await User.exists({ _id: user._id })) {
    //     res.status(401).json({ msg: 'login required' })
    //     return
    // }
    next();
}
exports.ensureLoggedIn = ensureLoggedIn;