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

  // 查询问题
  async queryProblems(queryDTO: ProblemQueryDTO) {
    const { user_id, role_id, problem_id } = queryDTO;
    console.log(`查询问题: user_id=${user_id}, role_id=${role_id}, problem_id=${problem_id || '未指定'}`);

    try {
      // 如果指定了问题ID，则查询单个问题
      if (problem_id) {
        const problem = await this.problemModel.findOne({
          where: { problem_id }
        });
        console.log('查询结果:', problem ? `找到问题: ${problem.title}, problem_id=${problem.problem_id}` : '未找到问题');

        if (!problem) {
          return { code: 404, message: '问题不存在', data: null };
        }

        // 如果是学生，需要查询该题的完成状态
        if (role_id === 0) {
          const userProblem = await this.userProblemModel.findOne({
            where: { user_id, problem_id }
          });
          console.log(`学生(${user_id})的提交记录:`, userProblem ? `找到记录，状态=${userProblem.status}` : '未找到记录');

          const result = {
            code: 200,
            message: '查询成功',
            data: [{
              problem_id: problem.problem_id,
              title: problem.title,
              detail: problem.detail,
              example_input: problem.example_input,
              example_output: problem.example_output,
              ques_tag: problem.ques_tag || undefined,
              status: userProblem?.status || 0,
              submit_count: 1,  // 暂时固定为1
              submission_time: userProblem?.submission_time || null  // 添加提交时间
            }]
          };
          console.log('返回单个问题的结果:', JSON.stringify(result));
          return result;
        } else {
          // 教师或管理员可以看到答案
          const result = {
            code: 200,
            message: '查询成功',
            data: [{
              problem_id: problem.problem_id,
              title: problem.title,
              detail: problem.detail,
              example_input: problem.example_input,
              example_output: problem.example_output,
              answer: problem.answer,
              ques_tag: problem.ques_tag || undefined,
              status: 0,  // 默认添加状态字段为0
              submit_count: 0,  // 默认添加提交次数为0
              submission_time: null  // 添加提交时间为空
            }]
          };
          console.log('返回单个问题的结果(教师/管理员):', JSON.stringify(result));
          return result;
        }
      }

      // 获取所有问题
      const allProblems = await this.problemModel.find();
      console.log(`获取到的所有问题数量: ${allProblems.length}`);

      // 根据角色返回不同的问题列表
      if (role_id === 0) {  // 学生
        // 获取学生的提交记录
        const userProblems = await this.userProblemModel.find({
          where: { user_id }
        });
        console.log(`学生(${user_id})的提交记录数量: ${userProblems.length}`);

        // 创建提交记录的映射，方便查找
        const userProblemMap = new Map(
          userProblems.map(up => [up.problem_id, up])
        );

        // 返回所有问题，未提交的状态为0
        const result = {
          code: 200,
          message: '查询成功',
          data: allProblems.map(problem => {
            const userProblem = userProblemMap.get(problem.problem_id);
            return {
              problem_id: problem.problem_id,
              title: problem.title,
              detail: problem.detail,
              example_input: problem.example_input,
              example_output: problem.example_output,
              ques_tag: problem.ques_tag || undefined,
              status: userProblem?.status || 0,
              submit_count: 1,  // 暂时固定为1
              submission_time: userProblem?.submission_time || null  // 添加提交时间
            };
          })
        };

        // 只打印前两个问题的详情，避免日志过长
        const sampleData = result.data.slice(0, 2).map(p => ({
          problem_id: p.problem_id,
          status: p.status,
          submission_time: p.submission_time
        }));
        console.log('返回问题列表结果(学生，样本):', JSON.stringify(sampleData));
        console.log('每个问题是否包含status字段:', result.data.every(p => 'status' in p));
        
        return result;
      } else {  // 教师或管理员
        console.log(`获取到的所有问题数量(教师/管理员): ${allProblems.length}`);

        // 如果有用户ID，尝试获取该用户的提交记录，用于显示状态（可选功能）
        let userProblemMap = new Map();
        if (user_id) {
          try {
            const userProblems = await this.userProblemModel.find({
              where: { user_id }
            });
            console.log(`用户(${user_id})的提交记录数量: ${userProblems.length}`);
            userProblemMap = new Map(
              userProblems.map(up => [up.problem_id, up])
            );
          } catch (error) {
            console.error(`获取用户提交记录失败: ${error.message}`);
            // 忽略错误，继续处理
          }
        }

        const result = {
          code: 200,
          message: '查询成功',
          data: allProblems.map(problem => {
            const userProblem = userProblemMap.get(problem.problem_id);
            return {
              problem_id: problem.problem_id,
              title: problem.title,
              detail: problem.detail,
              example_input: problem.example_input,
              example_output: problem.example_output,
              answer: problem.answer,
              ques_tag: problem.ques_tag || undefined,
              status: userProblem?.status || 0,  // 默认添加状态字段为0
              submit_count: 0,  // 默认添加提交次数为0
              submission_time: userProblem?.submission_time || null  // 添加提交时间
            };
          })
        };

        // 只打印前两个问题的ID
        const sampleData = result.data.slice(0, 2).map(p => ({
          problem_id: p.problem_id,
          status: p.status,
          submission_time: p.submission_time
        }));
        console.log('返回问题列表结果(教师/管理员，样本):', JSON.stringify(sampleData));
        
        return result;
      }
    } catch (error) {
      console.error('查询问题失败:', error);
      return { code: 500, message: '服务器错误', data: null };
    }
  }

  // 提交答案
  async submitAnswer(submitDTO: SubmitAnswerDTO) {
    const { user_id, role_id, problem_id, student_answer, problem_desc, submission_time } = submitDTO;

    // 检查角色权限
    if (role_id !== 0) {
      return { code: 403, message: '角色权限不足', data: null };
    }

    // 检查问题是否存在
    const problem = await this.problemModel.findOne({
      where: { problem_id: problem_id },
    });
    if (!problem) {
      return { code: 404, message: '问题不存在', data: null };
    }

    // 检查之前的提交记录
    let userProblem = await this.userProblemModel.findOne({
      where: { user_id: user_id, problem_id: problem_id },
    });

    // 如果之前提交过且状态为正确，直接返回成功
    if (userProblem && userProblem.status === 1) {
      return {
        code: 200,
        message: '该题目已经通过',
        data: {
          problem_id,
          status: userProblem.status,
          is_correct: true,
          submission_time: userProblem.submission_time
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

    // 处理提交时间
    let submissionDate: Date;
    
    // 如果客户端提供了时间，尝试使用客户端时间
    if (submission_time) {
      console.log(`使用客户端提供的提交时间: ${submission_time}`);
      try {
        // 尝试解析客户端提供的时间字符串
        submissionDate = new Date(submission_time);
        // 检查是否是有效日期
        if (isNaN(submissionDate.getTime())) {
          throw new Error('无效的日期格式');
        }
        // 确保只保留日期部分
        submissionDate.setHours(0, 0, 0, 0);
        console.log(`解析后的提交日期: ${submissionDate.toISOString()}`);
      } catch (error) {
        console.error(`解析客户端时间失败: ${error.message}，将使用服务器当前日期`);
        // 如果解析失败，使用服务器当前日期作为备选
        submissionDate = new Date();
        submissionDate.setHours(0, 0, 0, 0);
      }
    } else {
      // 如果客户端没有提供时间，使用服务器当前日期
      console.log('客户端未提供时间，使用服务器当前日期');
      submissionDate = new Date();
      submissionDate.setHours(0, 0, 0, 0);
    }
    
    console.log(`最终提交日期: ${submissionDate.toISOString()}`);

    // 保存或更新答案
    if (!userProblem) {
      userProblem = this.userProblemModel.create({
        user_id: user_id,
        problem_id: problem_id,
        student_answer: student_answer,
        status: isCorrect ? 1 : 2, // 1: 正确, 2: 错误
        submission_time: submissionDate // 使用确定的提交日期
      });
    } else {
      userProblem.student_answer = student_answer;
      userProblem.status = isCorrect ? 1 : 2; // 1: 正确, 2: 错误
      userProblem.submission_time = submissionDate; // 更新提交时间
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
        is_correct: isCorrect,
        submission_time: userProblem.submission_time // 返回提交时间
      },
    };
    
    // 如果答案错误或系统错误，添加错误信息
    if (errorMessage) {
      result.data['error_message'] = errorMessage;
    }

    return result;
  }

  // 导入问题
  async importProblems(problems: ImportProblemItemDTO[], role_id: number) {
    // 检查角色权限
    if (role_id !== 1 && role_id !== 2) {
      return { code: 403, message: '权限不足', data: null };
    }

    const imported = [];
    const failed = [];

    for (const problem of problems) {
      try {
        console.log(`导入问题: ${problem.ques_name}`);

        // 创建新问题，正确映射字段
        const newProblem = this.problemModel.create({
          title: problem.ques_name,
          detail: problem.ques_desc,
          example_input: problem.ques_in,
          example_output: problem.ques_out,
          answer: problem.ques_ans || '',
          ques_tag: problem.ques_tag || null, // 添加知识点标签，如果没有则为null
        });

        const savedProblem = await this.problemModel.save(newProblem);
        console.log(`问题导入成功: ID=${savedProblem.problem_id}, 标题=${savedProblem.title}, 知识点=${savedProblem.ques_tag || '无'}`);

        imported.push({
          problem_id: savedProblem.problem_id,
          title: savedProblem.title,
          ques_tag: savedProblem.ques_tag
        });
      } catch (error) {
        console.error(`导入问题 "${problem.ques_name}" 失败:`, error);
        failed.push({
          title: problem.ques_name,
          error: error.message
        });
      }
    }

    return {
      code: 200,
      message: '导入完成',
      data: { imported, failed }
    };
  }

  // 删除问题
  async deleteProblem(problem_id: number, role_id: number) {
    console.log(`尝试删除问题: problem_id=${problem_id}, 操作者角色ID=${role_id}`);
    
    // 检查操作者权限（只有管理员可以删除问题）
    if (role_id !== 2) {
      console.log('权限不足，只有管理员可以删除问题');
      return { code: 403, message: '权限不足，只有管理员可以删除问题', data: null };
    }

    try {
      // 查找问题
      const problem = await this.problemModel.findOne({ where: { problem_id } });
      console.log('查询结果:', problem ? `找到问题: ${problem.title}, problem_id=${problem.problem_id}` : '未找到问题');
      
      if (!problem) {
        return { code: 404, message: '问题不存在', data: null };
      }

      // 删除与该问题相关的所有提交记录
      await this.userProblemModel.delete({ problem: { problem_id } });
      console.log(`已删除与问题相关的所有提交记录: problem_id=${problem_id}`);

      // 删除问题
      await this.problemModel.remove(problem);
      console.log(`问题删除成功: problem_id=${problem_id}`);

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