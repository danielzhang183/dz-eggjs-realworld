'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();
  router.prefix('/api/v1');

  router.post('/users', controller.user.create);
  router.post('/user/login', controller.user.login);
  router.get('/user', auth, controller.user.getCurrentUser);
  router.patch('/user', auth, controller.user.update);
  router.get('/users/:userId', app.middleware.auth({ required: false }), controller.user.getUser);

  router.post('/users/:userId/subscribe', auth, controller.user.subscribe);
  router.delete('/users/:userId/subscribe', auth, controller.user.unsubscribe);
  router.get('/users/:userId/subscriptions', controller.user.getSubscriptions);
};
