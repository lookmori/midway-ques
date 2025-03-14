import { MidwayConfig } from '@midwayjs/core';
import { User } from '../entity/user.entity';
import { Problem } from '../entity/problem.entity';
import { UserProblem } from '../entity/user-problem.entity';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1683796159833_7382',
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '3364487975lfp.',
        database: 'py_ques',
        synchronize: true, // 自动同步数据库表结构（开发环境使用）
        logging: true, // 打印数据库查询日志
        entities: [User, Problem, UserProblem], // 直接使用实体类
      },
    },
  },
  // JWT配置
  jwt: {
    secret: 'your-secret-key', // 密钥
    expiresIn: '2h', // token过期时间
  },
} as MidwayConfig;
