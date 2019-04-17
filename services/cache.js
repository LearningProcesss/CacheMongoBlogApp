const mongoose = require('mongoose');
const keys = require('../config/keys');
const redis = require("redis"),
    redisclient = redis.createClient(keys.redisURI);
const util = require('util');

const exec = mongoose.Query.prototype.exec;

let cnt = 0;

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

    // cnt++;

    // console.log(`[${cnt}]: inside query`);

    // console.log(`[${cnt}]: ` + JSON.stringify(this.getQuery()));

    // console.log(`[${cnt}]: ` + JSON.stringify(this.mongooseCollection.name));

    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

    // console.log(`[${cnt}]: ` + key);

    const cacheValue = await redisclient.hget(this.hashKey, key);

    if (cacheValue) {
        // console.log('cached values: ' + JSON.stringify(cacheValue));

        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    redisclient.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    // console.log(result);

}

module.exports = {
    clearHash(hashKey) {
        redisclient.del(JSON.stringify(hashKey));
    }
};