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
 */
exports.getUser = async function (id) {

    if( typeof id === 'string' && id) {
        return await User.findById(id);
    }

    return await User.findById('5cbade4a564e06ee834f7808');
}

