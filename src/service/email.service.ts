import { Provide } from '@midwayjs/decorator';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

@Provide()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private verificationCodes: Map<string, { code: string; expireTime: number }> = new Map();

  constructor() {
    // 创建邮件传输对象
    this.transporter = nodemailer.createTransport({
      host: 'smtp.163.com',
      port: 465,
      secure: true,
      auth: {
        user: 'v18338258072@163.com', // 发件人邮箱
        pass: 'DUu6nfHLUSLUBaUv' // 邮箱授权码
      }
    });
  }

  // 生成6位随机验证码
  private generateVerificationCode(): string {
    return randomInt(100000, 999999).toString();
  }

  // 发送验证码邮件
  async sendVerificationCode(email: string): Promise<{ code: string; expireTime: number }> {
    const code = this.generateVerificationCode();
    const expireTime = 300; // 5分钟过期

    // 存储验证码和过期时间
    this.verificationCodes.set(email, {
      code,
      expireTime: Date.now() + expireTime * 1000
    });

    // 邮件内容
    const mailOptions = {
      from: 'v18338258072@163.com',
      to: email,
      subject: '验证码',
      text: `您的验证码是：${code}，${expireTime}秒内有效。`
    };

    try {
      // 发送邮件
      await this.transporter.sendMail(mailOptions);
      return { code, expireTime };
    } catch (error) {
      console.error('发送邮件失败:', error);
      throw error;
    }
  }

  // 验证验证码
  verifyCode(email: string, code: string): boolean {
    const verification = this.verificationCodes.get(email);
    if (!verification) {
      return false;
    }

    if (Date.now() > verification.expireTime) {
      this.verificationCodes.delete(email);
      return false;
    }

    if (verification.code !== code) {
      return false;
    }

    // 验证成功后删除验证码
    this.verificationCodes.delete(email);
    return true;
  }
} 