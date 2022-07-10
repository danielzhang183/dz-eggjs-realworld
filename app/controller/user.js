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
      ctx.throw(422, '邮箱已存在');
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

  async getCurrentUser() {
    const { ctx } = this;
    const { user } = ctx;
    ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
        token: ctx.header.authorization,
      },
    };
  }

  async update() {
    const { ctx } = this;
    const body = ctx.request.body;
    ctx.validate(
      {
        email: { type: 'email', required: false },
        password: { type: 'string', required: false },
        username: { type: 'string', required: false },
        channelDescription: { type: 'string', required: false },
        avatar: { type: 'string', required: false },
      },
      body
    );
    const userService = this.service.user;
    const user = ctx.user;
    if (body.username && body.username !== user.username && (await userService.findByUsername(body.username))) {
      ctx.throw(422, '用戶已存在');
    }
    if (body.email && body.email !== user.email && (await userService.findByEmail(body.email))) {
      ctx.throw(422, '邮箱已存在');
    }
    const newUser = await userService.updateUser(body);
    ctx.body = {
      user: {
        email: newUser.email,
        username: newUser.username,
        channelDescription: newUser.channelDescription,
        avatar: newUser.avatar,
        password: newUser.password,
      },
    };
  }

  async subscribe() {
    const { ctx, service } = this;
    const userId = ctx.user._id;
    const channelId = ctx.params.userId;
    if (userId.equals(channelId)) { ctx.throw(422, '用户不能订阅自己'); }
    const user = await service.user.subscribe(userId, channelId);
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed: true,
      },
    };
  }

  async unsubscribe() {
    const { ctx, service } = this;
    const userId = ctx.user._id;
    const channelId = ctx.params.userId;
    if (userId.equals(channelId)) { ctx.throw(422, '用户不能订阅自己'); }
    const user = await service.user.unsubscribe(userId, channelId);
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed: false,
      },
    };
  }

  async getUser() {
    const { ctx, app } = this;
    let isSubscribed = false;
    const channelId = ctx.params.userId;
    if (ctx.user) {
      const record = await app.model.Subscription.findOne({
        user: ctx.user._id,
        channel: channelId,
      });
      if (record) {
        isSubscribed = true;
      }
    }
    const user = await app.model.User.findById(channelId);
    ctx.body = {
      user: {
        ...ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed,
      },
    };
  }

  async getSubscriptions() {
    let subscriptions = await this.app.model.Subscription.find({
      user: this.ctx.params.userId,
    }).populate('channel');
    subscriptions = subscriptions.map(item => this.ctx.helper._.pick(item.channel, [
      '_id',
      'username',
      'avatar',
    ]));
    this.ctx.body = {
      subscriptions,
    };
  }
}

module.exports = UserController;
