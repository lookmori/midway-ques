import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { LoginDTO, RegisterDTO } from '../interface';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@midwayjs/jwt';
import { Inject } from '@midwayjs/decorator';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @Inject()
  jwtService: JwtService;

  // 用户登录
  async login(loginDTO: LoginDTO) {
    const { email, password, role_id } = loginDTO;
    
    // 查找用户
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      return { code: 401, message: '用户不存在', data: null };
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { code: 401, message: '密码错误', data: null };
    }

    // 验证角色
    if (user.roleId !== role_id) {
      return { code: 403, message: '角色权限不足', data: null };
    }

    // 生成 token
    const token = await this.jwtService.sign({ 
      userId: user.userId,
      email: user.email,
      roleId: user.roleId 
    });

    return {
      code: 200,
      message: '登录成功',
      data: {
        username: user.username,
        email: user.email,
        role_id: user.roleId,
        token,
      },
    };
  }

  // 用户注册
  async register(registerDTO: RegisterDTO) {
    const { email, password, role_id } = registerDTO;

    // 检查邮箱是否已注册
    const existUser = await this.userModel.findOne({ where: { email } });
    if (existUser) {
      return { code: 400, message: '邮箱已注册', data: null };
    }

    // 密码复杂度验证
    if (password.length < 6) {
      return { code: 422, message: '密码不符合复杂度要求', data: null };
    }

    // 生成用户名
    const username = `user_${Date.now()}`;

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userModel.create({
      username,
      email,
      password: hashedPassword,
      roleId: role_id,
    });

    await this.userModel.save(user);

    return {
      code: 200,
      message: '注册成功',
      data: {
        user_id: user.userId,
        username: user.username,
        email: user.email,
        role_id: user.roleId,
      },
    };
  }

  // 更新用户角色
  async updateRole(userId: number, roleId: number, operatorRoleId: number) {
    // 检查操作者权限
    if (roleId === 2 && operatorRoleId !== 2) {
      return { code: 403, message: '权限不足', data: null };
    }
    if (roleId === 1 && operatorRoleId < 1) {
      return { code: 403, message: '权限不足', data: null };
    }

    const user = await this.userModel.findOne({ where: { userId } });
    if (!user) {
      return { code: 404, message: '用户不存在', data: null };
    }

    user.roleId = roleId;
    await this.userModel.save(user);

    return {
      code: 200,
      message: roleId === 1 ? '教师添加成功' : '学生添加成功',
      data: null,
    };
  }

  // 根据邮箱查找用户
  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ where: { email } });
  }

  // 创建新用户
  async createUser(userData: { email: string; password: string; role_id: number }): Promise<User> {
    const { email, password, role_id } = userData;
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userModel.create({
      username: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      roleId: role_id
    });

    return await this.userModel.save(user);
  }
}
