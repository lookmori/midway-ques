import { Middleware, IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { Inject } from '@midwayjs/decorator';

@Middleware()
export class JwtMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  jwtService: JwtService;

  public static getName(): string {
    return 'jwt';
  }

  public async resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 排除不需要验证的路由
      if (ctx.path === '/api/login' || ctx.path === '/api/register') {
        return await next();
      }

      // 获取 token
      const token = ctx.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: 'Token不存在',
          data: null,
        };
        return;
      }

      try {
        // 验证 token
        const decoded = await this.jwtService.verify(token);
        ctx.state.user = decoded;
        await next();
      } catch (err) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: 'Token无效',
          data: null,
        };
      }
    };
  }
} 