import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { LoginDTO, RegisterDTO, GetUserInfoDTO } from '../interface';
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
    
    console.log(`尝试登录: email=${email}, role_id=${role_id}, 类型: ${typeof role_id}`);
    
    try {
      // 查找用户
      const user = await this.userModel.findOne({ where: { email } });
      console.log('查询结果:', user ? `找到用户: ${user.email}, userId=${user.userId}, roleId=${user.roleId}, 类型: ${typeof user.roleId}` : '未找到用户');
      
      if (!user) {
        return { code: 401, message: '用户不存在', data: null };
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`密码验证结果: ${isValid ? '正确' : '错误'}`);
      
      if (!isValid) {
        return { code: 401, message: '密码错误', data: null };
      }

      // 确保类型一致（将字符串转换为数字）
      const userRoleId = user.roleId;
      const requestRoleId = typeof role_id === 'string' ? parseInt(role_id) : role_id;
      
      // 验证角色
      console.log(`角色验证: 用户角色=${userRoleId} (${typeof userRoleId}), 请求角色=${requestRoleId} (${typeof requestRoleId})`);
      if (userRoleId !== requestRoleId) {
        return { code: 403, message: '角色权限不足', data: null };
      }

      // 生成 token
      const token = await this.jwtService.sign({ 
        userId: user.userId,
        email: user.email,
        roleId: user.roleId 
      });
      console.log('登录成功，已生成token');

      return {
        code: 200,
        message: '登录成功',
        data: {
          user_id: user.userId,
          username: user.username,
          email: user.email,
          role_id: user.roleId,
          token,
        },
      };
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 用户注册
  async register(registerDTO: RegisterDTO) {
    const { email, password, role_id } = registerDTO;

    console.log(`尝试注册: email=${email}, role_id=${role_id}`);
    
    try {
      // 检查邮箱是否已注册
      const existUser = await this.userModel.findOne({ where: { email } });
      console.log('检查邮箱是否已注册:', existUser ? '邮箱已存在' : '邮箱可用');
      
      if (existUser) {
        return { code: 400, message: '邮箱已注册', data: null };
      }

      // 密码复杂度验证
      if (password.length < 6) {
        console.log('密码长度不足6位');
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

      const savedUser = await this.userModel.save(user);
      console.log(`用户创建成功: userId=${savedUser.userId}, email=${savedUser.email}, roleId=${savedUser.roleId}`);

      return {
        code: 200,
        message: '注册成功',
        data: {
          user_id: savedUser.userId,
          username: savedUser.username,
          email: savedUser.email,
          role_id: savedUser.roleId,
        },
      };
    } catch (error) {
      console.error('注册过程中发生错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 更新用户角色
  async updateRole(userId: number, roleId: number, operatorRoleId: number) {
    console.log(`尝试更新用户角色: userId=${userId}, roleId=${roleId}, operatorRoleId=${operatorRoleId}`);
    
    // 检查操作者权限
    if (roleId === 2 && operatorRoleId !== 2) {
      return { code: 403, message: '权限不足', data: null };
    }
    if (roleId === 1 && operatorRoleId < 1) {
      return { code: 403, message: '权限不足', data: null };
    }

    try {
      const user = await this.userModel.findOne({ where: { userId } });
      console.log('查询结果:', user ? `找到用户: ${user.email}, userId=${user.userId}, roleId=${user.roleId}` : '未找到用户');
      
      if (!user) {
        return { code: 404, message: '用户不存在', data: null };
      }

      user.roleId = roleId;
      await this.userModel.save(user);
      console.log(`用户角色更新成功: userId=${user.userId}, 新角色=${roleId}`);

      return {
        code: 200,
        message: roleId === 1 ? '教师添加成功' : '学生添加成功',
        data: null,
      };
    } catch (error) {
      console.error('更新用户角色过程中发生错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 根据邮箱查找用户
  async findByEmail(email: string): Promise<User | null> {
    console.log(`根据邮箱查找用户: email=${email}`);
    try {
      const user = await this.userModel.findOne({ where: { email } });
      console.log('查询结果:', user ? `找到用户: ${user.email}, userId=${user.userId}, roleId=${user.roleId}` : '未找到用户');
      return user;
    } catch (error) {
      console.error('查找用户过程中发生错误:', error);
      return null;
    }
  }

  // 创建新用户
  async createUser(userData: { username?: string; email: string; password: string; role_id: number }): Promise<User> {
    const { username, email, password, role_id } = userData;
    console.log(`创建新用户: email=${email}, role_id=${role_id}, username=${username || '未提供'}`);
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userModel.create({
      username: username || `user_${Date.now()}`,
      email,
      password: hashedPassword,
      roleId: role_id
    });

    const savedUser = await this.userModel.save(user);
    console.log(`用户创建成功: userId=${savedUser.userId}, email=${savedUser.email}, roleId=${savedUser.roleId}`);
    return savedUser;
  }

  // 删除用户
  async deleteUser(userId: number, operatorRoleId: number) {
    console.log(`尝试删除用户: userId=${userId}, 操作者角色ID=${operatorRoleId}`);
    
    // 检查操作者权限（只有管理员可以删除用户）
    if (operatorRoleId !== 2) {
      console.log('权限不足，只有管理员可以删除用户');
      return { code: 403, message: '权限不足，只有管理员可以删除用户', data: null };
    }

    try {
      // 查找用户
      const user = await this.userModel.findOne({ where: { userId } });
      console.log('查询结果:', user ? `找到用户: ${user.email}, userId=${user.userId}, roleId=${user.roleId}` : '未找到用户');
      
      if (!user) {
        return { code: 404, message: '用户不存在', data: null };
      }

      // 不允许删除管理员账号
      if (user.roleId === 2) {
        console.log('不允许删除管理员账号');
        return { code: 403, message: '不允许删除管理员账号', data: null };
      }

      // 删除用户
      await this.userModel.remove(user);
      console.log(`用户删除成功: userId=${userId}`);

      return {
        code: 200,
        message: '用户删除成功',
        data: null
      };
    } catch (error) {
      console.error('删除用户过程中发生错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 修改用户信息
  async updateUser(operatorId: number, operatorRoleId: number, userId: number, updateData: { username?: string; password?: string }) {
    console.log(`尝试修改用户信息: 操作者ID=${operatorId}, 操作者角色ID=${operatorRoleId}, 被修改用户ID=${userId}`);
    
    try {
      // 查找被修改的用户
      const targetUser = await this.userModel.findOne({ where: { userId } });
      console.log('查询结果:', targetUser ? `找到用户: ${targetUser.email}, userId=${targetUser.userId}, roleId=${targetUser.roleId}` : '未找到用户');
      
      if (!targetUser) {
        return { code: 404, message: '用户不存在', data: null };
      }

      // 权限检查
      // 1. 教师只能修改学生信息
      // 2. 管理员可以修改所有人信息（除了其他管理员）
      if (operatorRoleId === 1) { // 教师
        if (targetUser.roleId !== 0) {
          console.log('权限不足，教师只能修改学生信息');
          return { code: 403, message: '权限不足，教师只能修改学生信息', data: null };
        }
      } else if (operatorRoleId === 2) { // 管理员
        if (targetUser.roleId === 2 && targetUser.userId !== operatorId) {
          console.log('不允许修改其他管理员信息');
          return { code: 403, message: '不允许修改其他管理员信息', data: null };
        }
      } else {
        console.log('权限不足，只有教师和管理员可以修改用户信息');
        return { code: 403, message: '权限不足，只有教师和管理员可以修改用户信息', data: null };
      }

      // 更新用户信息
      let isUpdated = false;
      
      // 更新用户名
      if (updateData.username) {
        targetUser.username = updateData.username;
        isUpdated = true;
        console.log(`更新用户名为: ${updateData.username}`);
      }
      
      // 更新密码
      if (updateData.password) {
        // 密码复杂度验证
        if (updateData.password.length < 6) {
          console.log('密码长度不足6位');
          return { code: 400, message: '密码长度不能小于6位', data: null };
        }
        
        // 加密密码
        targetUser.password = await bcrypt.hash(updateData.password, 10);
        isUpdated = true;
        console.log('密码已更新');
      }

      if (!isUpdated) {
        console.log('没有提供需要更新的信息');
        return { code: 400, message: '没有提供需要更新的信息', data: null };
      }

      // 保存更新
      await this.userModel.save(targetUser);
      console.log(`用户信息更新成功: userId=${userId}`);

      return {
        code: 200,
        message: '用户信息更新成功',
        data: {
          user_id: targetUser.userId,
          username: targetUser.username,
          email: targetUser.email,
          role_id: targetUser.roleId
        }
      };
    } catch (error) {
      console.error('修改用户信息过程中发生错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 获取用户信息
  async getUserInfo(getUserInfoDTO: GetUserInfoDTO) {
    const { user_id, role_id, find_id } = getUserInfoDTO;
    
    try {
      // 验证查询者是否存在
      const operator = await this.userModel.findOne({ where: { userId: user_id } });
      if (!operator) {
        return { code: 401, message: '查询者不存在', data: null };
      }
      
      // 验证查询者角色是否匹配
      if (operator.roleId !== role_id) {
        return { code: 403, message: '查询者角色不匹配', data: null };
      }
      
      // 根据角色权限和查询参数返回用户信息
      let users = [];
      
      // 学生只能查看自己
      if (role_id === 0) {
        const user = await this.userModel.findOne({ where: { userId: user_id } });
        if (user) {
          const { password, ...userInfo } = user;
          users = [userInfo];
        }
        return { code: 200, message: '获取用户信息成功', data: users };
      } 
      
      // 教师可以查看所有学生和自己
      else if (role_id === 1) {
        // 如果指定了find_id（要查询的角色ID）
        if (find_id !== undefined) {
          // 教师只能查看学生(0)或自己的角色(1)
          if (find_id !== 0 && find_id !== 1) {
            return { code: 403, message: '权限不足，教师只能查看学生信息和教师信息', data: null };
          }
          
          if (find_id === 0) {
            // 查询所有学生
            const allStudents = await this.userModel.find({ where: { roleId: 0 } });
            users = allStudents.map(user => {
              const { password, ...userInfo } = user;
              return userInfo;
            });
          } else if (find_id === 1) {
            // 只能查看自己
            const teacher = await this.userModel.findOne({ where: { userId: user_id } });
            if (teacher) {
              const { password, ...teacherInfo } = teacher;
              users = [teacherInfo];
            }
          }
        } else {
          // 未指定find_id，返回所有学生和自己
          const allStudents = await this.userModel.find({ where: { roleId: 0 } });
          users = allStudents.map(user => {
            const { password, ...userInfo } = user;
            return userInfo;
          });
          
          // 添加教师自己的信息
          const teacher = await this.userModel.findOne({ where: { userId: user_id } });
          if (teacher) {
            const { password, ...teacherInfo } = teacher;
            users.push(teacherInfo);
          }
        }
        
        return { code: 200, message: '获取用户列表成功', data: users };
      } 
      
      // 管理员可以查看所有人
      else if (role_id === 2) {
        // 如果指定了find_id（要查询的角色ID）
        if (find_id !== undefined) {
          if (![0, 1, 2].includes(find_id)) {
            return { code: 400, message: '角色ID不正确', data: null };
          }
          
          const usersWithRole = await this.userModel.find({ where: { roleId: find_id } });
          users = usersWithRole.map(user => {
            const { password, ...userInfo } = user;
            return userInfo;
          });
        } else {
          // 未指定find_id，返回所有用户
          const allUsers = await this.userModel.find();
          users = allUsers.map(user => {
            const { password, ...userInfo } = user;
            return userInfo;
          });
        }
        
        return { code: 200, message: '获取用户列表成功', data: users };
      }
      
      return { code: 403, message: '未知角色', data: null };
    } catch (error) {
      console.error('获取用户信息错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }
}
