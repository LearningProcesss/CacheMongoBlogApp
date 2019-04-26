const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.createUserTest = function () {
    return new User({}).save();
}

/**
 * @param  {ObjectId} id
 */
exports.deleteUserTest = async function (id) {
    try {
        return await User.findByIdAndRemove({ _id: id });
    } catch (error) {
        console.log(error);
    }
}

/**
 * @param  {string} id
 * @param  {boolean} createTestUser
 */
exports.getUser = async function (id, createTestUser) {

    if (createTestUser) {
        const u = new User({});
        return await u.save();
    }

    if (typeof id === 'string' && id) {
        return await User.findById(id);
    }

    return await User.findById('5cbade4a564e06ee834f7808');
}

