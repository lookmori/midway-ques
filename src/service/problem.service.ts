import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from '../entity/problem.entity';
import { UserProblem } from '../entity/user-problem.entity';
import { ImportProblemItemDTO, ProblemQueryDTO, SubmitAnswerDTO } from '../interface';
import { Inject, Config } from '@midwayjs/decorator';
import { CozeService } from './coze.service';

@Provide()
export class ProblemService {
  @InjectEntityModel(Problem)
  problemModel: Repository<Problem>;

  @InjectEntityModel(UserProblem)
  userProblemModel: Repository<UserProblem>;

  @Inject()
  cozeService: CozeService;

  @Config('workflow')
  workflowConfig: {
    problemJudgeId: string;
  };

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
            answer: problem.answer,
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
        answer: problem.answer,
      })),
    };
  }

  // 提交答案
  async submitAnswer(submitDTO: SubmitAnswerDTO) {
    const { user_id, role_id, problem_id, student_answer, problem_desc } = submitDTO;

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

    // 检查之前的提交记录
    let userProblem = await this.userProblemModel.findOne({
      where: { userId: user_id, problemId: problem_id },
    });

    // 如果之前提交过且状态为正确，直接返回成功
    if (userProblem && userProblem.status === 1) {
      return {
        code: 200,
        message: '该题目已经通过',
        data: {
          problem_id,
          status: userProblem.status,
          is_correct: true
        }
      };
    }

    // 调用Coze API判断答案是否正确
    console.log(`调用Coze API判断答案是否正确，问题ID: ${problem_id}`);
    const workflowId = this.workflowConfig.problemJudgeId;
    
    // 使用传入的问题描述（如果有），否则使用数据库中的问题详情
    const questionDesc = problem_desc || problem.detail;
    console.log(`使用问题描述: ${questionDesc}`);
    
    const cozeParams = {
      ques_desc: questionDesc,
      ques_ans: student_answer
    };

    let isCorrect = false;
    let errorMessage = '';

    try {
      const cozeResult = await this.cozeService.invokeWorkflow(workflowId, cozeParams);
      console.log(`Coze API返回结果: ${JSON.stringify(cozeResult)}`);

      if (cozeResult.code === 200 && cozeResult.data) {
        try {
          // 解析data字段中的JSON字符串
          const resultData = JSON.parse(cozeResult.data.data);
          // code_status表示问题是否正确
          isCorrect = resultData.code_status === true;
          // code_error包含错误信息，当答案错误时返回给客户端
          errorMessage = resultData.code_error || '';
          console.log(`解析Coze结果: isCorrect=${isCorrect}, errorMessage=${errorMessage}`);
        } catch (error) {
          console.error('解析Coze API返回结果失败:', error);
          isCorrect = false;
          errorMessage = '评判系统错误';
        }
      } else {
        isCorrect = false;
        errorMessage = '评判系统错误';
      }
    } catch (error) {
      console.error('调用Coze API失败:', error);
      isCorrect = false;
      errorMessage = '评判系统错误';
    }

    // 保存或更新答案
    if (!userProblem) {
      userProblem = this.userProblemModel.create({
        userId: user_id,
        problemId: problem_id,
        studentAnswer: student_answer,
        status: isCorrect ? 1 : 2, // 1: 正确, 2: 错误
      });
    } else {
      userProblem.studentAnswer = student_answer;
      userProblem.status = isCorrect ? 1 : 2; // 1: 正确, 2: 错误
    }

    // 如果工作流调用失败，设置状态为0
    if (errorMessage === '评判系统错误') {
      userProblem.status = 0;
    }

    await this.userProblemModel.save(userProblem);

    // 构建返回结果
    const result = {
      code: 200,
      message: isCorrect ? '提交成功' : (errorMessage === '评判系统错误' ? '评判系统错误，请稍后重试' : '提交成功'),
      data: {
        problem_id,
        status: userProblem.status,
        is_correct: isCorrect
      },
    };
    
    // 如果答案错误或系统错误，添加错误信息
    if (errorMessage) {
      result.data['error_message'] = errorMessage;
    }

    return result;
  }

  // 导入问题
  async importProblems(problems: ImportProblemItemDTO[], operatorRoleId: number) {
    console.log(`尝试导入问题，数量: ${problems.length}, 操作者角色ID: ${operatorRoleId}`);
    
    // 检查操作者权限（只有教师和管理员可以导入问题）
    if (operatorRoleId < 1) {
      console.log('权限不足，只有教师和管理员可以导入问题');
      return { code: 403, message: '权限不足，只有教师和管理员可以导入问题', data: null };
    }

    try {
      const importedProblems = [];
      const failedProblems = [];

      // 逐个导入问题
      for (const problem of problems) {
        try {
          console.log(`导入问题: ${problem.ques_name}`);
          
          // 创建问题实体
          const newProblem = this.problemModel.create({
            title: problem.ques_name,
            detail: problem.ques_desc,
            exampleInput: problem.ques_in,
            exampleOutput: problem.ques_out,
            answer: problem.ques_ans, // 添加问题答案
          });

          // 保存到数据库
          const savedProblem = await this.problemModel.save(newProblem);
          console.log(`问题导入成功: ID=${savedProblem.problemId}, 标题=${savedProblem.title}`);
          
          importedProblems.push({
            problem_id: savedProblem.problemId,
            title: savedProblem.title
          });
        } catch (error) {
          console.error(`导入问题 "${problem.ques_name}" 失败:`, error);
          failedProblems.push({
            title: problem.ques_name,
            error: error.message
          });
        }
      }

      return {
        code: 200,
        message: `成功导入 ${importedProblems.length} 个问题，失败 ${failedProblems.length} 个`,
        data: {
          imported: importedProblems,
          failed: failedProblems
        }
      };
    } catch (error) {
      console.error('导入问题过程中发生错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 删除问题
  async deleteProblem(problemId: number, operatorRoleId: number) {
    console.log(`尝试删除问题: problemId=${problemId}, 操作者角色ID=${operatorRoleId}`);
    
    // 检查操作者权限（只有管理员可以删除问题）
    if (operatorRoleId !== 2) {
      console.log('权限不足，只有管理员可以删除问题');
      return { code: 403, message: '权限不足，只有管理员可以删除问题', data: null };
    }

    try {
      // 查找问题
      const problem = await this.problemModel.findOne({ where: { problemId } });
      console.log('查询结果:', problem ? `找到问题: ${problem.title}, problemId=${problem.problemId}` : '未找到问题');
      
      if (!problem) {
        return { code: 404, message: '问题不存在', data: null };
      }

      // 删除与该问题相关的所有提交记录
      await this.userProblemModel.delete({ problem: { problemId } });
      console.log(`已删除与问题相关的所有提交记录: problemId=${problemId}`);

      // 删除问题
      await this.problemModel.remove(problem);
      console.log(`问题删除成功: problemId=${problemId}`);

      return {
        code: 200,
        message: '问题删除成功',
        data: null
      };
    } catch (error) {
      console.error('删除问题过程中发生错误:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }
} 