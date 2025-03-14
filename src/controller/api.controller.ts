import { Inject, Controller, Post, Body } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { ProblemService } from '../service/problem.service';
import { 
  LoginDTO, 
  RegisterDTO, 
  ProblemQueryDTO, 
  SubmitAnswerDTO,
  AddUserDTO 
} from '../interface';
import { Validate } from '@midwayjs/validate';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  problemService: ProblemService;

  // 用户登录
  @Post('/login')
  @Validate()
  async login(@Body() loginDTO: LoginDTO) {
    return await this.userService.login(loginDTO);
  }

  // 用户注册
  @Post('/register')
  @Validate()
  async register(@Body() registerDTO: RegisterDTO) {
    return await this.userService.register(registerDTO);
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
    const operatorRoleId = this.ctx.state.user.roleId;
    return await this.userService.updateRole(
      addUserDTO.user_id,
      1,
      operatorRoleId
    );
  }

  // 添加学生
  @Post('/students')
  @Validate()
  async addStudent(@Body() addUserDTO: AddUserDTO) {
    const operatorRoleId = this.ctx.state.user.roleId;
    return await this.userService.updateRole(
      addUserDTO.user_id,
      0,
      operatorRoleId
    );
  }
}
