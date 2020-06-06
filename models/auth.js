const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    passwordHash: String, //hashed password
})

authSchema.statics.validPassword = async function (user_id, password) {
    let auth = await this.findOne({ user_id }, 'passwordHash');
    if (!auth) {
        console.log('erorr in auth.validpassword')
        throw Error('Invalid user_id.')
    }
    return bcrypt.compare(password, auth.passwordHash)
}
authSchema.statics.createNew = async function (user_id, authDat) {
    let password = authDat.password;
    if (!password && password.lenght === 0) {
        throw Error('password required for auth.createNew')
    }
    let passwordHash = await bcrypt.hash(password, 10) //auto gens salt
    await this.create({
        user_id,
        passwordHash
    })
}
module.exports = mongoose.model('Auth', authSchema)