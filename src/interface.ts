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

// 用户基本信息
export interface UserBaseInfo {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
}

// 用户列表响应
export interface UserListVO {
  users: UserBaseInfo[];
}

// 登录请求
export interface LoginDTO {
  email: string;
  password: string;
  role_id: number;
}

// 登录响应
export interface LoginVO extends UserBaseInfo {
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
export interface RegisterVO extends UserBaseInfo {}

// 发送验证码请求
export interface SendVerificationDTO {
  email: string;
}

// 发送验证码响应
export interface SendVerificationVO {
  code: string;
  expire_time: number;
}

// 验证验证码请求
export interface VerifyCodeDTO {
  email: string;
  code: string;
}

// 重置密码请求
export interface ResetPasswordDTO {
  email: string;
  code: string;
  new_password: string;
}

// 问题基本信息
export interface ProblemBaseInfo {
  problem_id: number;
  title: string;
  detail: string;
  example_input?: string;
  example_output?: string;
  answer?: string;
  ques_tag?: string;
}

// 问题查询请求
export interface ProblemQueryDTO {
  user_id: number;
  role_id: number;
  problem_id?: number;
}

// 问题列表响应
export interface ProblemListVO {
  problems: (ProblemBaseInfo & {
    status?: number;
    submit_count?: number;
  })[];
}

// 学生视角的问题
export interface ProblemForStudent extends ProblemBaseInfo {
  status: number;
  submit_count: number;
}

// 教师视角的问题
export interface ProblemForTeacher extends ProblemBaseInfo {}

// 提交答案请求
export interface SubmitAnswerDTO {
  user_id: number;
  role_id: number;
  problem_id: number;
  student_answer: string;
  problem_desc?: string;
  submission_time?: string; // 提交时间，格式：YYYY-MM-DD，可选参数
}

// 提交答案响应
export interface SubmitAnswerVO {
  problem_id: number;
  status: number;
  is_correct: boolean;
  error_message?: string;
  submission_time: string; // 提交时间，格式：YYYY-MM-DD
}

// 添加用户请求
export interface AddUserDTO {
  username: string;
  email: string;
  password: string;
  role_id: number;
}

// 导入问题项
export interface ImportProblemItemDTO {
  ques_name: string;    // 问题名称
  ques_desc: string;    // 问题详细描述
  ques_in?: string;     // 示例输入
  ques_out?: string;    // 示例输出
  ques_ans?: string;    // 问题的答案
  ques_tag?: string;    // 知识点标签
}

// 导入问题请求
export interface ImportProblemsDTO {
  problems: ImportProblemItemDTO[];
  role_id: number;
}

// 导入问题响应
export interface ImportProblemVO {
  imported: {
    problem_id: number;
    title: string;
    ques_tag?: string;
  }[];
  failed: {
    title: string;
    error: string;
  }[];
}

// 删除用户请求
export interface DeleteUserDTO {
  operator_id: number;
  role_id: number;
  user_id: number;
}

// 修改用户信息请求
export interface UpdateUserDTO {
  operator_id: number;
  role_id: number;
  user_id: number;
  username?: string;
  password?: string;
}

// 获取用户信息请求
export interface GetUserInfoDTO {
  user_id: number;
  role_id: number;
  find_id?: number;  // 要查询的角色ID（可选）
}

// 删除问题请求
export interface DeleteProblemDTO {
  operator_id: number;
  role_id: number;
  problem_id: number;
}
