import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from '../entity/problem.entity';
import { UserProblem } from '../entity/user-problem.entity';
import { ProblemQueryDTO, SubmitAnswerDTO } from '../interface';

@Provide()
export class ProblemService {
  @InjectEntityModel(Problem)
  problemModel: Repository<Problem>;

  @InjectEntityModel(UserProblem)
  userProblemModel: Repository<UserProblem>;

  // 获取问题列表
  async getProblems(query: ProblemQueryDTO) {
    const { user_id, role_id } = query;

    // 基础查询
    const problems = await this.problemModel.find();

    // 学生视角
    if (role_id === 0) {
      const userProblems = await this.userProblemModel.find({
        where: { userId: user_id },
      });

      return {
        code: 200,
        message: '查询成功',
        data: problems.map(problem => {
          const userProblem = userProblems.find(up => up.problemId === problem.problemId);
          return {
            problem_id: problem.problemId,
            title: problem.title,
            detail: problem.detail,
            example_input: problem.exampleInput,
            example_output: problem.exampleOutput,
            status: userProblem?.status || 0,
            submit_count: userProblem ? 1 : 0, // 这里需要根据实际情况统计
          };
        }),
      };
    }

    // 教师/管理员视角
    return {
      code: 200,
      message: '查询成功',
      data: problems.map(problem => ({
        problem_id: problem.problemId,
        title: problem.title,
        detail: problem.detail,
        example_input: problem.exampleInput,
        example_output: problem.exampleOutput,
      })),
    };
  }

  // 提交答案
  async submitAnswer(submitDTO: SubmitAnswerDTO) {
    const { user_id, role_id, problem_id, student_answer } = submitDTO;

    // 检查角色权限
    if (role_id !== 0) {
      return { code: 403, message: '角色权限不足', data: null };
    }

    // 检查问题是否存在
    const problem = await this.problemModel.findOne({
      where: { problemId: problem_id },
    });
    if (!problem) {
      return { code: 404, message: '问题不存在', data: null };
    }

    // 保存或更新答案
    let userProblem = await this.userProblemModel.findOne({
      where: { userId: user_id, problemId: problem_id },
    });

    if (!userProblem) {
      userProblem = this.userProblemModel.create({
        userId: user_id,
        problemId: problem_id,
        studentAnswer: student_answer,
        status: 1, // 这里需要根据实际判题结果设置状态
      });
    } else {
      userProblem.studentAnswer = student_answer;
      userProblem.status = 1; // 这里需要根据实际判题结果设置状态
    }

    await this.userProblemModel.save(userProblem);

    return {
      code: 200,
      message: '答案已提交',
      data: {
        problem_id,
        status: userProblem.status,
      },
    };
  }
} 