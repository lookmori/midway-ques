import { Provide } from '@midwayjs/decorator';
import { Config } from '@midwayjs/decorator';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationCode } from '../entity/verification-code.entity';

@Provide()
export class EmailService {
  private transporter: nodemailer.Transporter;

  @InjectEntityModel(VerificationCode)
  verificationCodeModel: Repository<VerificationCode>;

  @Config('email')
  emailConfig: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    }
  };

  @Config('verification')
  verificationConfig: {
    expireTime: number;
  };

  constructor() {
    // 创建邮件传输对象
    this.transporter = null; // 在afterPropertySet中初始化
  }

  // 在所有属性注入后初始化
  async onReady() {
    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: this.emailConfig.secure,
      auth: {
        user: this.emailConfig.auth.user,
        pass: this.emailConfig.auth.pass
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
    const expireTime = this.verificationConfig.expireTime; // 从配置获取过期时间
    const expireAt = new Date(Date.now() + expireTime * 1000);

    console.log(`生成验证码: ${code}, 邮箱: ${email}, 过期时间: ${expireAt}`);

    // 创建新验证码
    const verificationCode = this.verificationCodeModel.create({
      email,
      code,
      expireAt
    });

    // 保存到数据库
    await this.verificationCodeModel.save(verificationCode);
    console.log(`验证码已保存到数据库, ID: ${verificationCode.id}`);

    // 邮件内容
    const mailOptions = {
      from: this.emailConfig.auth.user,
      to: email,
      subject: '验证码',
      text: `您的验证码是：${code}，${expireTime}秒内有效。`
    };

    try {
      // 发送邮件
      await this.transporter.sendMail(mailOptions);
      console.log(`验证码邮件已发送到 ${email}`);
      return { code, expireTime };
    } catch (error) {
      console.error('发送邮件失败:', error);
      throw error;
    }
  }

  // 验证验证码
  async verifyCode(email: string, code: string): Promise<boolean> {
    console.log(`验证验证码: ${code}, 邮箱: ${email}`);
    
    // 从数据库查找该邮箱的最新验证码
    const verificationCodes = await this.verificationCodeModel.find({
      where: { email },
      order: { createdAt: 'DESC' },
      take: 1
    });
    
    if (verificationCodes.length === 0) {
      console.log(`未找到该邮箱的验证码记录`);
      return false;
    }

    const latestCode = verificationCodes[0];
    console.log(`数据库中的最新验证码: ${latestCode.code}, 过期时间: ${latestCode.expireAt}, 创建时间: ${latestCode.createdAt}`);
    
    // 检查是否过期
    const now = new Date();
    if (now > latestCode.expireAt) {
      console.log(`验证码已过期, 当前时间: ${now}, 过期时间: ${latestCode.expireAt}`);
      return false;
    }

    // 检查验证码是否匹配
    if (latestCode.code !== code) {
      console.log(`验证码不匹配, 输入: ${code}, 实际: ${latestCode.code}`);
      return false;
    }

    console.log(`验证码验证成功`);
    return true;
  }
} 