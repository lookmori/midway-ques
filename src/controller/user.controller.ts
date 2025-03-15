import { Controller, Post, Body, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../service/user.service';
import { EmailService } from '../service/email.service';

@Controller('/api')
export class UserController {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Inject()
  userService: UserService;

  @Inject()
  emailService: EmailService;

  @Post('/register')
  async register(@Body() body: { email: string; password: string; role_id: number; code: string }) {
    try {
      const { email, password, role_id, code } = body;

      // 验证验证码
      const isValidCode = this.emailService.verifyCode(email, code);
      if (!isValidCode) {
        return {
          code: 400,
          message: '验证码无效或已过期',
          data: null
        };
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          code: 400,
          message: '邮箱格式不正确',
          data: null
        };
      }

      // 验证密码长度
      if (password.length < 6) {
        return {
          code: 400,
          message: '密码长度不能小于6位',
          data: null
        };
      }

      // 验证角色ID
      if (![0, 1, 2].includes(role_id)) {
        return {
          code: 400,
          message: '角色ID不正确',
          data: null
        };
      }

      // 检查邮箱是否已注册
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        return {
          code: 400,
          message: '该邮箱已注册',
          data: null
        };
      }

      // 创建用户
      const user = await this.userService.createUser({
        email,
        password,
        role_id
      });

      return {
        code: 200,
        message: '注册成功',
        data: {
          user_id: user.userId,
          email: user.email,
          role_id: user.roleId
        }
      };
    } catch (error) {
      return {
        code: 500,
        message: '注册失败',
        data: null
      };
    }
  }
} 