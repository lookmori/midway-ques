import { Inject, Controller, Post, Body } from '@midwayjs/decorator';
import { EmailService } from '../service/email.service';

@Controller('/api')
export class VerificationController {
  @Inject()
  emailService: EmailService;

  @Post('/send-code')
  async sendVerificationCode(@Body() body: { email: string }) {
    try {
      const { email } = body;
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          code: 400,
          message: '邮箱格式不正确',
          data: null
        };
      }

      const { code, expireTime } = await this.emailService.sendVerificationCode(email);
      
      return {
        code: 200,
        message: '验证码发送成功',
        data: {
          code: code,
          expire_time: expireTime
        }
      };
    } catch (error) {
      return {
        code: 500,
        message: '验证码发送失败',
        data: null
      };
    }
  }
} 