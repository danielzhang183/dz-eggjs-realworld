'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    ctx.validate({
      username: { type: 'string' },
      email: { type: 'email' },
      password: { type: 'string' },
    });

    const userService = this.service.user;
    const body = ctx.request.body;
    if (await userService.findByUsername(body.username)) {
      ctx.throw(422, '用戶已存在');
    }
    if (await userService.findByEmail(body.email)) {
      ctx.throw(422, '用戶已存在');
    }
    const user = await userService.createUser(body);
    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
        token: await userService.createToken({ userId: user._id }),
      },
    };
  }

  async login() {
    const { ctx } = this;
    const body = ctx.request.body;
    ctx.validate(
      {
        email: { type: 'email' },
        password: { type: 'string' },
      },
      body
    );
    const userService = this.service.user;
    const user = await userService.findByEmail(body.email);

    if (!user) {
      ctx.throw(422, '用户不存在');
    }
    if (ctx.helper.md5(body.password) !== user.password) {
      ctx.throw(422, '密码不正确');
    }
    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
        token: await userService.createToken({ userId: user._id }),
      },
    };
  }
}

module.exports = UserController;
