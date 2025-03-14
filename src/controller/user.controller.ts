import { Controller, Post, Body } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcryptjs';

@Controller('/api/user')
export class UserController {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Post('/register')
  async register(@Body() registerDTO: { email: string; password: string; role_id: number }) {
    try {
      // 检查邮箱是否已注册
      const existUser = await this.userModel.findOne({ where: { email: registerDTO.email } });
      if (existUser) {
        return { code: 400, message: '邮箱已注册', data: null };
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(registerDTO.password, 10);

      // 创建用户
      const user = this.userModel.create({
        username: `user_${Date.now()}`,
        email: registerDTO.email,
        password: hashedPassword,
        roleId: registerDTO.role_id,
      });

      await this.userModel.save(user);

      return {
        code: 200,
        message: '注册成功',
        data: {
          userId: user.userId,
          username: user.username,
          email: user.email,
          roleId: user.roleId,
        },
      };
    } catch (error) {
      console.error('注册失败:', error);
      return { code: 500, message: '注册失败', data: null };
    }
  }
} 