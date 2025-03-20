/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

// 通用响应接口
export interface CommonResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 登录请求
export interface LoginDTO {
  email: string;
  password: string;
  role_id: number;
}

// 登录响应
export interface LoginVO {
  username: string;
  email: string;
  role_id: number;
  token: string;
}

// 注册请求
export interface RegisterDTO {
  email: string;
  password: string;
  role_id: number;
  code: string;  // 验证码
}

// 注册响应
export interface RegisterVO {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
}

// 问题查询请求
export interface ProblemQueryDTO {
  user_id: number;
  role_id: number;
}

// 学生视角的问题
export interface ProblemForStudent {
  problem_id: number;
  title: string;
  detail: string;
  example_input: string;
  example_output: string;
  answer?: string;  // 可选的问题答案
  status: number;
  submit_count: number;
  ques_tag?: string; // 问题知识点标签
}

// 教师视角的问题
export interface ProblemForTeacher {
  problem_id: number;
  title: string;
  detail: string;
  example_input: string;
  example_output: string;
  answer?: string;  // 可选的问题答案
  ques_tag?: string; // 问题知识点标签
}

// 提交答案请求
export interface SubmitAnswerDTO {
  user_id: number;
  role_id: number;
  problem_id: number;
  student_answer: string;
  problem_desc?: string; // 问题描述（可选）
}

// 提交答案响应
export interface SubmitAnswerVO {
  problem_id: number;
  status: number;
}

// 添加用户的DTO
export interface AddUserDTO {
  user_id?: number;    // 用户ID（可选，如果是更新现有用户）
  username: string;    // 用户名
  email: string;       // 邮箱
  password: string;    // 密码
  role_id: number;     // 操作者角色ID
}

// 导入问题的DTO
export interface ImportProblemItemDTO {
  ques_name: string;    // 问题名称
  ques_desc: string;    // 问题详细描述
  ques_in: string;      // 示例输入
  ques_out: string;     // 示例输出
  ques_ans: string;     // 问题的正确答案
  ques_tag?: string;    // 问题知识点标签（可选）
}

export interface ImportProblemsDTO {
  problems: ImportProblemItemDTO[];
  role_id: number;      // 操作者角色ID
}

// 删除用户的DTO
export interface DeleteUserDTO {
  user_id: number;     // 要删除的用户ID
  role_id: number;     // 操作者角色ID（必须是管理员）
}

// 修改用户信息的DTO
export interface UpdateUserDTO {
  operator_id: number;    // 修改者ID
  role_id: number;        // 修改者角色ID
  user_id: number;        // 被修改者ID
  username?: string;      // 新用户名（可选）
  password?: string;      // 新密码（可选）
}

// 获取用户信息的DTO
export interface GetUserInfoDTO {
  user_id: number;        // 查询者ID
  role_id: number;        // 查询者角色ID
  find_id?: number;       // 要查询的角色ID（可选，如果不提供则根据查询者角色返回相应列表）
}

// 删除问题的DTO
export interface DeleteProblemDTO {
  problem_id: number;  // 要删除的问题ID
  role_id: number;     // 操作者角色ID
}
