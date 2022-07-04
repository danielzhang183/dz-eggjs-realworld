const { md5 } = require('../extend/helper');
const jwt = require('jsonwebtoken');

const Service = require('egg').Service;

class UserService extends Service {
  get User() {
    return this.app.model.User;
  }

  findByUsername(username) {
    return this.User.findOne({ username });
  }

  findByEmail(email) {
    return this.User.findOne({ email }).select('+password');
  }

  async createUser(data) {
    data.password = md5(data.password);
    const user = new this.User(data);
    await user.save();
    return user;
  }

  async createToken({ userId }) {
    const { secret, expiresIn } = this.app.config.jwt;
    return jwt.sign({ userId }, secret, { expiresIn });
  }
}

module.exports = UserService;
