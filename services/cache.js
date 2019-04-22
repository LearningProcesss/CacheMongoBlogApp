const mongoose = require('mongoose');
const keys = require('../config/keys');
const redis = require("redis"),
    redisclient = redis.createClient(keys.redisURI);
const util = require('util');

const exec = mongoose.Query.prototype.exec;

redisclient.get = util.promisify(redisclient.get);

redisclient.hget = util.promisify(redisclient.hget);

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || 'default');

    return this;
}

mongoose.Query.prototype.exec = async function () {

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

    const cacheValue = await redisclient.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    redisclient.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
}

module.exports = {
    clearHash(hashKey) {
        redisclient.del(JSON.stringify(hashKey));
    }
};