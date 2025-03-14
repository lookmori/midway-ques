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
  status: number;
  submit_count: number;
}

// 教师视角的问题
export interface ProblemForTeacher {
  problem_id: number;
  title: string;
  detail: string;
  example_input: string;
  example_output: string;
}

// 提交答案请求
export interface SubmitAnswerDTO {
  user_id: number;
  role_id: number;
  problem_id: number;
  student_answer: string;
}

// 提交答案响应
export interface SubmitAnswerVO {
  problem_id: number;
  status: number;
}

// 添加用户请求
export interface AddUserDTO {
  user_id: number;
  role_id: number;
}
