module.exports = () => {
  return async (ctx, next) => {
    const token = ctx.headers.authorization?.split('Bearer ')[1] || null;
    if (!token) ctx.throw(401);
    try {
      const { userId } = ctx.service.user.verifyToken(token);
      ctx.user = await ctx.model.User.findById(userId);
    } catch (err) {
      ctx.throw(401);
    }
    await next();
  };
};
