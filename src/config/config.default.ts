import { MidwayConfig } from '@midwayjs/core';
import * as fs from 'fs';
import * as path from 'path';

// 默认私钥（仅作为备用，生产环境应该使用环境变量或私钥文件）
const DEFAULT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQChG07fKDPSpTxD
Sw/oZorkgicvGYauJj7idWYkaxZ/GR7O3mcUMkh699Rm5wNjlHC7dEoPyezPImc4
ovmtdIXaW/+nJA3YUQBfwl8uKx8AfULwNho2PWbXoBeMyaLwXa6tKeQpA+vGnXhC
kbegJNHmyNzD7R/tBx3G3yKY4SA8neC+5HI4YEuyBGhEfjVaWAjP47NwEmuFEIdF
sV1a/p/doY7WR2WTrTHgrAsZ9QTI+10vDxC2YY/JeBDhLcQGIlr3Z99fUIjgbLnG
BPSjBCVmG60AKJYTN3olvu0SkUsv4cEzoestvx7bc0JShqVfpx3e2LmKYOqKN7m8
Mr3qIVpzAgMBAAECggEAK3J74L6syx/4koVJsvkEd/+JpbASnCCAUP4sH6IpnPkf
T9a2ocG1vkPbqiyew1oi1MrVtlBUZr/2alW5U8fa2Tp6RY75lN6zZR+8H21NnQoq
5TER/JKui3QHJday9HOvSc/EUjNWgGezKPC3Pp7vZHfC4auvMnL62skOQYBk+zOC
xkFVth+PjdlRGBnaKwtIgHbQlSN4eZlx2IV3QECfOHT3kXii2BY3ErbOnYl61z5U
+I1FQJnf0gQX8ftCV259969uxtA+zxI49p51V7YeLU5TYRd7+Lj/78REfJz4CGo9
165Zj/JGJojBYm/TCOR3KzJr9KeB/BHNiVpgm6AL0QKBgQDYr3yGmStCbXLCYJWI
cv+knraIMcZtTxoO9F6M/27T4dHdY6bqr/p6Eb8M4zeAufNY/gLgKO5ARYIWxt6i
17+vE40EzMUXTIW4OKmeflRgx8uoOfZNTTP3n9EaR+uxh9u4cFtfg6l3bE6jKOIe
JBuALYXTL55DQvMfXU0uFQ5a7wKBgQC+VlIbbcR3iGbnqJhtVR3/CR8/o2X0djA+
D7CA1295lHJiH75I4NgDbuUYG3M0YhkEpG2WLZNJUVL35mhxpbngjabKJLVAZenY
M3lZWz5EyTzNXV+p2JGfbFioZaO1NwLYCbJZvw+C3Qnp0+fUxcOkL8eoWFWw/Tnc
diGWHltIvQKBgQC2szBR5O/esJ3kWr96L0xxpwjMyPs/y0Rze4QFapItwOfMvWtN
0ldleXUXDrYLqb4POQ1/p8NLGdBYGBI8R6FtoxRyCZ3cyT6uV8hcxLOsbom/LDAK
eZ/pmC0c9as7IwwV9VZ1sHPBJ+ceFyigtV0itD90E2Bj4h1QQsECq+pQrQKBgQCL
5tDlHlKZdaYFwrN/MWAh9GeGlCi9fh3JkCixGyjx2X4Vx7VKxhGgvGMhzBNqvmwb
MGzoRMmMy3zLgAzm8+RjPFsLG94p3n76jiM03c8wKiZJ4McPBYNMBgxIgqTI7w1l
FAOG2duh2ayOtVYi29YImaIMiBk8RXTBKgdX2ypHlQKBgBRJ5JnZmNzPhqdr9nOh
XHBOCDbPd5v9LQzSNPc5zf734l0F/vpLsNfK6ofQdLbNqAOuSHJAWLTFg5onDZst
iSyIlaiO9kTYXl37AH5nS8Xf0i+Hr45u9ZoD6JO7DcmUMdAoPvFaSbIFaKsVxy7I
jpYk4vQ6agF0r/3G7dy3Y+sI
-----END PRIVATE KEY-----`;

// 尝试读取私钥文件
const getPrivateKey = () => {
  // 如果环境变量中有私钥，优先使用
  if (process.env.COZE_PRIVATE_KEY && process.env.COZE_PRIVATE_KEY.trim() !== '') {
    console.log('使用环境变量中的私钥');
    return process.env.COZE_PRIVATE_KEY;
  }

  // 尝试从文件读取
  const privateKeyPath = process.env.COZE_PRIVATE_KEY_PATH || './private_key.pem';
  try {
    const privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf-8');
    if (privateKey && privateKey.trim() !== '') {
      console.log(`成功从文件 ${privateKeyPath} 读取私钥`);
      return privateKey;
    }
    console.warn(`私钥文件 ${privateKeyPath} 内容为空，将使用默认私钥`);
  } catch (error) {
    console.warn(`无法读取私钥文件: ${privateKeyPath}，将使用默认私钥`);
  }

  // 使用默认私钥
  console.log('使用默认私钥');
  return DEFAULT_PRIVATE_KEY;
};

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1687849416943_6346',
  koa: {
    port: process.env.PORT || 7001,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret', // 建议在生产环境中使用环境变量
    expiresIn: '2d', // 过期时间
  },
  // MySQL 配置
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        username: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'your-password',
        database: process.env.MYSQL_DATABASE || 'py_ques',
        synchronize: false, // 生产环境设置为 false
        logging: process.env.NODE_ENV === 'development',
        entities: ['**/entity/*.entity{.ts,.js}'],
        // 连接池配置
        poolSize: 10,
        connectorPackage: 'mysql2',
        extra: {
          connectionLimit: 10,
          waitForConnections: true,
          queueLimit: 0,
        },
      }
    }
  },
  // 邮件服务配置
  emailConfig: {
    host: process.env.EMAIL_HOST || 'smtp.qq.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    auth: {
      user: process.env.EMAIL_USER || 'your-email@qq.com',
      pass: process.env.EMAIL_PASS || 'your-email-password'
    },
    secure: true
  },
  // CORS 配置
  cors: {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  },
  // Coze 配置
  coze: {
    clientType: 'jwt',
    clientId: process.env.COZE_CLIENT_ID || '1119333527611',
    wwwBase: process.env.COZE_WWW_BASE || 'https://www.coze.cn',
    apiBase: process.env.COZE_API_BASE || 'https://api.coze.cn',
    publicKeyId: process.env.COZE_PUBLIC_KEY_ID || '6e6iZCcnD-T8Bf-zFIfJAoYAnBSDZ8nR-njNGTHrPa4',
    privateKey: getPrivateKey(),
  },
  // 验证码配置
  verification: {
    expireTime: process.env.VERIFICATION_CODE_EXPIRE_TIME ? parseInt(process.env.VERIFICATION_CODE_EXPIRE_TIME) : 300,
  },
  // Coze工作流配置
  workflow: {
    problemJudgeId: process.env.COZE_WORKFLOW_ID || '7476350823728218175',
  }
} as MidwayConfig;
