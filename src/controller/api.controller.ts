import { Inject, Controller, Post, Body } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { ProblemService } from '../service/problem.service';
import { EmailService } from '../service/email.service';
import { 
  LoginDTO, 
  RegisterDTO, 
  ProblemQueryDTO, 
  SubmitAnswerDTO,
  AddUserDTO,
  ImportProblemItemDTO,
  DeleteUserDTO,
  UpdateUserDTO,
  GetUserInfoDTO,
  DeleteProblemDTO
} from '../interface';
import { Validate } from '@midwayjs/validate';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcryptjs';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  problemService: ProblemService;

  @Inject()
  emailService: EmailService;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  // 用户登录
  @Post('/login')
  @Validate()
  async login(@Body() loginDTO: LoginDTO) {
    console.log('收到登录请求:', JSON.stringify(loginDTO));
    const result = await this.userService.login(loginDTO);
    console.log('登录结果:', JSON.stringify(result));
    return result;
  }

  // 用户注册
  @Post('/register')
  @Validate()
  async register(@Body() registerDTO: RegisterDTO & { code: string }) {
    try {
      const { email, password, role_id, code } = registerDTO;
      console.log(`开始注册流程，邮箱: ${email}, 角色ID: ${role_id}`);

      // 验证验证码
      console.log(`验证验证码: ${code}`);
      const isValidCode = await this.emailService.verifyCode(email, code);
      if (!isValidCode) {
        console.log(`验证码验证失败`);
        return {
          code: 400,
          message: '验证码无效或已过期',
          data: null
        };
      }
      console.log(`验证码验证成功`);

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log(`邮箱格式不正确: ${email}`);
        return {
          code: 400,
          message: '邮箱格式不正确',
          data: null
        };
      }

      // 验证密码长度
      if (password.length < 6) {
        console.log(`密码长度不足: ${password.length}`);
        return {
          code: 400,
          message: '密码长度不能小于6位',
          data: null
        };
      }

      // 验证角色ID
      if (![0, 1, 2].includes(role_id)) {
        console.log(`角色ID不正确: ${role_id}`);
        return {
          code: 400,
          message: '角色ID不正确',
          data: null
        };
      }

      // 调用userService.register方法，该方法内部会检查邮箱是否已注册
      console.log(`调用 userService.register 方法`);
      const result = await this.userService.register(registerDTO);
      console.log(`注册结果: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.error('注册失败:', error);
      return {
        code: 500,
        message: '注册失败',
        data: null
      };
    }
  }

  // 找回密码
  @Post('/reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    try {
      const { email, code, newPassword } = body;

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
      if (newPassword.length < 6) {
        return {
          code: 400,
          message: '密码长度不能小于6位',
          data: null
        };
      }

      // 验证验证码
      const isValidCode = await this.emailService.verifyCode(email, code);
      if (!isValidCode) {
        return {
          code: 400,
          message: '验证码无效或已过期',
          data: null
        };
      }

      // 查找用户
      const user = await this.userModel.findOne({ where: { email } });
      if (!user) {
        return {
          code: 404,
          message: '该邮箱未注册',
          data: null
        };
      }

      // 更新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.userModel.save(user);

      return {
        code: 200,
        message: '密码重置成功',
        data: null
      };
    } catch (error) {
      return {
        code: 500,
        message: '密码重置失败',
        data: null
      };
    }
  }

  // 问题列表
  @Post('/problems')
  @Validate()
  async getProblems(@Body() query: ProblemQueryDTO) {
    return await this.problemService.getProblems(query);
  }

  // 提交答案
  @Post('/problems/submit')
  @Validate()
  async submitAnswer(@Body() submitDTO: SubmitAnswerDTO) {
    return await this.problemService.submitAnswer(submitDTO);
  }

  // 添加教师
  @Post('/teachers')
  @Validate()
  async addTeacher(@Body() addUserDTO: AddUserDTO) {
    console.log('收到添加教师请求:', JSON.stringify(addUserDTO));
    try {
      const { username, email, password, role_id } = addUserDTO;
      
      // 验证操作者权限（只有管理员可以添加教师）
      const operatorRoleId = role_id;
      if (operatorRoleId !== 2) {
        return { code: 403, message: '权限不足，只有管理员可以添加教师', data: null };
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { code: 400, message: '邮箱格式不正确', data: null };
      }
      
      // 验证密码长度
      if (password.length < 6) {
        return { code: 400, message: '密码长度不能小于6位', data: null };
      }
      
      // 检查邮箱是否已存在
      const existingUser = await this.userModel.findOne({ where: { email } });
      if (existingUser) {
        return { code: 400, message: '该邮箱已被注册', data: null };
      }
      
      // 创建新用户
      const newUser = await this.userService.createUser({
        username,
        email,
        password,
        role_id: 1  // 教师角色
      });
      
      console.log(`教师添加成功: userId=${newUser.userId}, email=${newUser.email}`);
      
      return {
        code: 200,
        message: '教师添加成功',
        data: {
          user_id: newUser.userId,
          username: newUser.username,
          email: newUser.email,
          role_id: newUser.roleId
        }
      };
    } catch (error) {
      console.error('添加教师失败:', error);
      return { code: 500, message: '添加教师失败', data: null };
    }
  }

  // 添加学生
  @Post('/students')
  @Validate()
  async addStudent(@Body() addUserDTO: AddUserDTO) {
    console.log('收到添加学生请求:', JSON.stringify(addUserDTO));
    try {
      const { username, email, password, role_id } = addUserDTO;
      
      // 验证操作者权限（教师和管理员都可以添加学生）
      const operatorRoleId = role_id;
      if (operatorRoleId < 1) {
        return { code: 403, message: '权限不足，只有教师和管理员可以添加学生', data: null };
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { code: 400, message: '邮箱格式不正确', data: null };
      }
      
      // 验证密码长度
      if (password.length < 6) {
        return { code: 400, message: '密码长度不能小于6位', data: null };
      }
      
      // 检查邮箱是否已存在
      const existingUser = await this.userModel.findOne({ where: { email } });
      if (existingUser) {
        return { code: 400, message: '该邮箱已被注册', data: null };
      }
      
      // 创建新用户
      const newUser = await this.userService.createUser({
        username,
        email,
        password,
        role_id: 0  // 学生角色
      });
      
      console.log(`学生添加成功: userId=${newUser.userId}, email=${newUser.email}`);
      
      return {
        code: 200,
        message: '学生添加成功',
        data: {
          user_id: newUser.userId,
          username: newUser.username,
          email: newUser.email,
          role_id: newUser.roleId
        }
      };
    } catch (error) {
      console.error('添加学生失败:', error);
      return { code: 500, message: '添加学生失败', data: null };
    }
  }

  // 导入问题
  @Post('/problems/import')
  async importProblems(@Body() body: { problems: ImportProblemItemDTO[], role_id: number }) {
    console.log('收到导入问题请求，问题数量:', body.problems.length);
    
    try {
      // 检查操作者权限
      const { role_id, problems } = body;
      
      // 调用服务方法导入问题
      const result = await this.problemService.importProblems(problems, role_id);
      console.log('导入问题结果:', JSON.stringify(result));
      
      return result;
    } catch (error) {
      console.error('导入问题失败:', error);
      return {
        code: 500,
        message: '导入问题失败',
        data: null
      };
    }
  }

  // 删除用户
  @Post('/users/delete')
  @Validate()
  async deleteUser(@Body() deleteUserDTO: DeleteUserDTO) {
    console.log('收到删除用户请求:', JSON.stringify(deleteUserDTO));
    try {
      const { user_id, role_id } = deleteUserDTO;
      
      // 调用服务方法删除用户
      const result = await this.userService.deleteUser(user_id, role_id);
      console.log('删除用户结果:', JSON.stringify(result));
      
      return result;
    } catch (error) {
      console.error('删除用户失败:', error);
      return {
        code: 500,
        message: '删除用户失败',
        data: null
      };
    }
  }

  // 修改用户信息
  @Post('/users/update')
  @Validate()
  async updateUser(@Body() updateUserDTO: UpdateUserDTO) {
    console.log('收到修改用户信息请求:', JSON.stringify(updateUserDTO));
    try {
      const { operator_id, role_id, user_id, username, password } = updateUserDTO;
      
      // 验证参数
      if (!user_id) {
        return { code: 400, message: '缺少被修改用户ID', data: null };
      }
      
      if (!username && !password) {
        return { code: 400, message: '至少需要提供一项要修改的信息（用户名或密码）', data: null };
      }
      
      // 调用服务方法修改用户信息
      const result = await this.userService.updateUser(
        operator_id,
        role_id,
        user_id,
        { username, password }
      );
      
      console.log('修改用户信息结果:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('修改用户信息失败:', error);
      return {
        code: 500,
        message: '修改用户信息失败',
        data: null
      };
    }
  }

  // 获取用户信息
  @Post('/get-user-info')
  @Validate()
  async getUserInfo(@Body() getUserInfoDTO: GetUserInfoDTO) {
    try {
      // 参数验证
      const { user_id, role_id } = getUserInfoDTO;
      
      if (user_id === undefined || role_id === undefined) {
        return { code: 400, message: '参数错误，缺少必要参数', data: null };
      }
      
      // 调用服务方法获取用户信息
      const result = await this.userService.getUserInfo(getUserInfoDTO);
      return result;
    } catch (error) {
      console.error('获取用户信息错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 删除问题
  @Post('/problems/delete')
  @Validate()
  async deleteProblem(@Body() deleteDTO: DeleteProblemDTO) {
    try {
      const { problem_id, role_id } = deleteDTO;
      
      // 参数验证
      if (problem_id === undefined || role_id === undefined) {
        return { code: 400, message: '参数错误，缺少必要参数', data: null };
      }
      
      // 调用服务方法删除问题
      const result = await this.problemService.deleteProblem(problem_id, role_id);
      return result;
    } catch (error) {
      console.error('删除问题错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }
}
