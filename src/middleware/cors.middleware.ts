import { Middleware } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class CorsMiddleware implements IMiddleware<Context, NextFunction> {
  public static getName(): string {
    return 'cors';
  }

  public async resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 允许来自所有域名的请求
      ctx.set('Access-Control-Allow-Origin', '*');
      // 允许的请求方法
      ctx.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      // 允许的请求头
      ctx.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept'
      );
      // 允许发送cookie
      ctx.set('Access-Control-Allow-Credentials', 'true');
      
      // 对于OPTIONS请求直接返回200
      if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        return;
      }
      
      await next();
    };
  }
} 