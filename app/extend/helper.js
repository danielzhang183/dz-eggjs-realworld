const crypto = require('crypto');
const _ = require('loadsh');

exports.md5 = str => {
  return crypto.createHash('md5').update(str).digest('hex');
};

exports._ = _;
