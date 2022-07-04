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

  verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret);
  }

  updateUser(user) {
    return this.User.findByIdAndUpdate(this.ctx.user._id, user, { new: true });
  }
}

module.exports = UserService;
