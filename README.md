# Python 在线编程系统 API 文档

## 基础信息
- 基础URL: `http://localhost:7001`
- 所有请求都需要设置 `Content-Type: application/json` 请求头
- 除了登录和注册接口外，其他接口都需要在请求头中携带 `Authorization: Bearer <token>`

## 环境变量配置

本项目使用环境变量进行配置管理，以下是所有可配置的环境变量及其说明：

### 服务器配置
- `PORT`: 服务器监听端口，默认为 7001（在 src/config/config.default.ts 中使用）

### 数据库配置
- `DB_HOST`: 数据库主机地址，默认为 localhost（在 src/config/config.default.ts 中使用）
- `DB_PORT`: 数据库端口，默认为 3306（在 src/config/config.default.ts 中使用）
- `DB_USERNAME`: 数据库用户名，默认为 root（在 src/config/config.default.ts 中使用）
- `DB_PASSWORD`: 数据库密码，默认为 123456（在 src/config/config.default.ts 中使用）
- `DB_DATABASE`: 数据库名称，默认为 py_ques（在 src/config/config.default.ts 中使用）
- `DB_SYNCHRONIZE`: 是否自动同步数据库结构，默认为 true（在 src/config/config.default.ts 中使用）
- `DB_LOGGING`: 是否启用数据库日志，默认为 true（在 src/config/config.default.ts 中使用）

### JWT配置
- `JWT_SECRET`: JWT 密钥，默认为 your-jwt-secret（在 src/config/config.default.ts 中使用）
- `JWT_EXPIRES_IN`: JWT 过期时间，默认为 1h（在 src/config/config.default.ts 中使用）

### Coze API配置
- `COZE_CLIENT_ID`: Coze 客户端 ID（在 src/config/config.default.ts 中使用）
- `COZE_API_BASE`: Coze API 基础 URL，默认为 https://api.coze.cn（在 src/config/config.default.ts 中使用）
- `COZE_WWW_BASE`: Coze 网站基础 URL，默认为 https://www.coze.cn（在 src/config/config.default.ts 中使用）
- `COZE_PUBLIC_KEY_ID`: Coze 公钥 ID（在 src/config/config.default.ts 中使用）
- `COZE_PRIVATE_KEY_PATH`: Coze 私钥文件路径，默认为 ./private_key.pem（在 src/config/config.default.ts 中使用）
- `COZE_PRIVATE_KEY`: Coze 私钥内容，如果无法读取私钥文件则使用此环境变量（在 src/config/config.default.ts 中使用）
- `COZE_WORKFLOW_ID`: Coze 工作流 ID，用于判断 Python 代码正确性（在 src/service/problem.service.ts 中使用）

### 邮件服务配置
- `EMAIL_HOST`: 邮件服务器地址，默认为 smtp.163.com（在 src/service/email.service.ts 中使用）
- `EMAIL_PORT`: 邮件服务器端口，默认为 465（在 src/service/email.service.ts 中使用）
- `EMAIL_SECURE`: 是否使用 SSL/TLS，默认为 true（在 src/service/email.service.ts 中使用）
- `EMAIL_USER`: 邮件发送账号（在 src/service/email.service.ts 中使用）
- `EMAIL_PASS`: 邮件发送密码或授权码（在 src/service/email.service.ts 中使用）

### 验证码配置
- `VERIFICATION_CODE_EXPIRE_TIME`: 验证码过期时间（秒），默认为 300（在 src/service/email.service.ts 中使用）

## 快速开始

1. 复制 `.env.example` 文件为 `.env`，并根据实际情况修改配置
2. 安装依赖：`npm install`
3. 启动服务：`npm run dev`

## 接口列表

### 1. 用户认证相关接口

#### 1.1 发送验证码
- 请求路径：`POST /api/send-code`
- 请求参数：
```json
{
  "email": "string"      // 邮箱地址
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "expire_time": "number"  // 验证码过期时间（秒）
  } | null
}
```

#### 1.2 用户登录
- 请求路径：`POST /api/login`
- 请求参数：
```json
{
  "email": "string",      // 邮箱
  "password": "string",   // 密码
  "role_id": "number"     // 角色ID (0学生,1教师,2管理员)
}
```
- 响应内容：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user_id": 1,
    "username": "用户名",
    "email": "用户邮箱",
    "role_id": 0,
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### 1.3 用户注册
- 请求路径：`POST /api/register`
- 请求参数：
```json
{
  "email": "string",      // 邮箱（必须唯一，一个邮箱只能注册一个账号）
  "password": "string",   // 密码（长度不少于6位）
  "role_id": "number",    // 角色ID (0学生,1教师,2管理员)
  "code": "string"        // 验证码
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "user_id": "number",  // 用户ID
    "username": "string", // 用户名
    "email": "string",    // 邮箱
    "role_id": "number"   // 角色ID
  } | null
}
```
- 可能的错误响应：
  - 400: 邮箱已注册，请直接登录或使用其他邮箱
  - 400: 验证码无效或已过期
  - 400: 邮箱格式不正确
  - 400: 密码长度不能小于6位
  - 400: 角色ID不正确
  - 500: 注册失败

#### 1.4 找回密码
- 请求路径：`POST /api/reset-password`
- 请求参数：
```json
{
  "email": "string",      // 邮箱
  "code": "string",       // 验证码（5分钟内有效）
  "newPassword": "string" // 新密码（长度不少于6位）
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": null
}
```
- 可能的错误响应：
  - 400: 验证码无效或已过期
  - 400: 邮箱格式不正确
  - 400: 密码长度不能小于6位
  - 404: 该邮箱未注册
  - 500: 密码重置失败

### 2. 问题相关接口

#### 2.1 获取问题列表
- 请求路径：`POST /api/problems`
- 请求参数：
```json
{
  "user_id": "number",    // 用户ID
  "role_id": "number"     // 角色ID
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": [
    {
      "problem_id": "number",    // 问题ID
      "title": "string",        // 问题标题
      "detail": "string",       // 问题详情
      "example_input": "string", // 示例输入
      "example_output": "string", // 示例输出
      "answer": "string",       // 问题答案（可选）
      "status": "number",       // 状态（仅学生视角）
      "submit_count": "number"  // 提交次数（仅学生视角）
    }
  ] | null
}
```

#### 2.2 提交答案
- 请求路径：`POST /api/problems/submit`
- 请求参数：
```json
{
  "user_id": "number",        // 用户ID
  "role_id": "number",        // 角色ID
  "problem_id": "number",     // 问题ID
  "student_answer": "string",  // 学生答案（Python代码）
  "problem_desc": "string"    // 可选，题目描述。如果不提供，将使用数据库中的题目详情
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "problem_id": "number",   // 问题ID
    "status": "number",       // 提交状态（1: 错误, 2: 正确）
    "is_correct": "boolean",  // 是否正确（来自 Coze API 的 code_status）
    "error_message": "string" // 错误信息（来自 Coze API 的 code_error，仅当 is_correct 为 false 时存在）
  } | null
}
```

- 可能的错误响应：
  - 400: 请求参数错误
  - 401: 未授权
  - 403: 权限不足（非学生角色）
  - 404: 题目不存在
  - 500: 服务器错误

- 响应示例（正确答案）：
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "problem_id": 1,
    "status": 2,
    "is_correct": true
  }
}
```

- 响应示例（错误答案）：
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "problem_id": 1,
    "status": 1,
    "is_correct": false,
    "error_message": "输入输出格式不正确，请检查您的代码"
  }
}
```

**注意事项**：
1. `is_correct` 字段来自 Coze API 的 `code_status`，表示代码是否正确
2. `error_message` 字段来自 Coze API 的 `code_error`，包含具体的错误信息
3. `status` 字段与 `is_correct` 对应：
   - `is_correct` 为 true 时，`status` 为 2（正确）
   - `is_correct` 为 false 时，`status` 为 1（错误）
4. 必须使用学生角色（role_id = 0）才能提交答案
5. 提交的答案会被保存到数据库，可以查看历史提交记录

#### 2.3 导入问题
- 请求路径：`POST /api/problems/import`
- 请求参数：
```json
{
  "problems": [
    {
      "ques_name": "string",    // 问题名称
      "ques_desc": "string",    // 问题详细描述
      "ques_in": "string",      // 示例输入
      "ques_out": "string",     // 示例输出
      "ques_ans": "string"      // 问题的答案（可选）
    }
  ],
  "role_id": "number"           // 操作者角色ID（必须是教师或管理员）
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "imported": [         // 成功导入的问题
      {
        "problem_id": "number",  // 问题ID
        "title": "string"        // 问题标题
      }
    ],
    "failed": [           // 导入失败的问题
      {
        "title": "string",       // 问题标题
        "error": "string"        // 错误信息
      }
    ]
  } | null
}
```

- 可能的错误响应：
  - 400: 请求参数错误
  - 401: 未授权
  - 403: 权限不足（非教师或管理员角色）
  - 500: 服务器错误

- 请求示例：
```json
{
  "problems": [
    {
      "ques_name": "列表元素求和",
      "ques_desc": "输入一个列表，输出所有元素的和",
      "ques_in": "[1,2,3,4]",
      "ques_out": "10",
      "ques_ans": ""
    },
    {
      "ques_name": "寻找列表最大值",
      "ques_desc": "输入一个列表，输出其中的最大值",
      "ques_in": "[5,8,3,10]",
      "ques_out": "10",
      "ques_ans": ""
    }
  ],
  "role_id": 1
}
```

- 响应示例：
```json
{
  "code": 200,
  "message": "成功导入 2 个问题，失败 0 个",
  "data": {
    "imported": [
      {
        "problem_id": 1,
        "title": "列表元素求和"
      },
      {
        "problem_id": 2,
        "title": "寻找列表最大值"
      }
    ],
    "failed": []
  }
}
```

**注意事项**：
1. 只有教师（role_id=1）和管理员（role_id=2）可以导入问题
2. 问题的答案（ques_ans）字段是可选的，可以用于存储标准答案
3. 导入过程中出现错误不会中断整个导入过程，会继续尝试导入其他问题

#### 2.4 删除问题
- 请求路径：`POST /api/problems/delete`
- 请求参数：
```json
{
  "problem_id": "number",  // 要删除的问题ID
  "role_id": "number"      // 操作者角色ID（必须是管理员，role_id=2）
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": null
}
```

- 可能的错误响应：
  - 400: 参数错误，缺少必要参数
  - 403: 权限不足，只有管理员可以删除问题
  - 404: 问题不存在
  - 500: 服务器错误

- 响应示例（成功）：
```json
{
  "code": 200,
  "message": "问题删除成功",
  "data": null
}
```

**注意事项**：
1. 只有管理员（role_id=2）可以删除问题
2. 删除问题会同时删除与该问题相关的所有提交记录
3. 删除操作不可撤销，请谨慎操作

### 3. 用户管理接口

#### 3.1 添加教师
- 请求路径：`POST /api/teachers`
- 请求参数：
```json
{
  "username": "string",   // 用户名
  "email": "string",      // 邮箱（必须唯一）
  "password": "string",   // 密码（长度不少于6位）
  "role_id": "number"     // 操作者角色ID（必须是管理员，role_id=2）
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "user_id": "number",  // 用户ID
    "username": "string", // 用户名
    "email": "string",    // 邮箱
    "role_id": "number"   // 角色ID
  } | null
}
```

- 可能的错误响应：
  - 400: 邮箱格式不正确
  - 400: 密码长度不能小于6位
  - 400: 该邮箱已被注册
  - 403: 权限不足，只有管理员可以添加教师
  - 500: 添加教师失败

#### 3.2 添加学生
- 请求路径：`POST /api/students`
- 请求参数：
```json
{
  "username": "string",   // 用户名
  "email": "string",      // 邮箱（必须唯一）
  "password": "string",   // 密码（长度不少于6位）
  "role_id": "number"     // 操作者角色ID（必须是教师或管理员）
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "user_id": "number",  // 用户ID
    "username": "string", // 用户名
    "email": "string",    // 邮箱
    "role_id": "number"   // 角色ID
  } | null
}
```

- 可能的错误响应：
  - 400: 邮箱格式不正确
  - 400: 密码长度不能小于6位
  - 400: 该邮箱已被注册
  - 403: 权限不足，只有教师和管理员可以添加学生
  - 500: 添加学生失败

#### 3.3 删除用户
- 请求路径：`POST /api/users/delete`
- 请求参数：
```json
{
  "user_id": "number",    // 要删除的用户ID
  "role_id": "number"     // 操作者角色ID（必须是管理员，role_id=2）
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": null
}
```

- 可能的错误响应：
  - 403: 权限不足，只有管理员可以删除用户
  - 403: 不允许删除管理员账号
  - 404: 用户不存在
  - 500: 删除用户失败

**注意事项**：
1. 只有管理员（role_id=2）可以删除用户
2. 不允许删除管理员账号
3. 删除用户会同时删除与该用户相关的所有数据

#### 3.4 修改用户信息
- 请求路径：`POST /api/users/update`
- 请求参数：
```json
{
  "operator_id": "number",  // 修改者ID
  "role_id": "number",      // 修改者角色ID
  "user_id": "number",      // 被修改者ID
  "username": "string",     // 新用户名（可选）
  "password": "string"      // 新密码（可选，长度不少于6位）
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "user_id": "number",  // 用户ID
    "username": "string", // 用户名
    "email": "string",    // 邮箱
    "role_id": "number"   // 角色ID
  } | null
}
```

- 可能的错误响应：
  - 400: 至少需要提供一项要修改的信息（用户名或密码）
  - 400: 密码长度不能小于6位
  - 403: 权限不足，教师只能修改学生信息
  - 403: 权限不足，只有教师和管理员可以修改用户信息
  - 403: 不允许修改其他管理员信息
  - 404: 用户不存在
  - 500: 修改用户信息失败

**注意事项**：
1. 教师（role_id=1）只能修改学生（role_id=0）的信息
2. 管理员（role_id=2）可以修改所有人的信息，但不能修改其他管理员的信息
3. 用户名和密码至少需要提供一项
4. 密码长度不能小于6位

## 获取用户信息接口

### 请求路径
```
POST /api/get-user-info
```

### 请求参数
| 参数名 | 类型 | 是否必须 | 说明 |
| --- | --- | --- | --- |
| user_id | number | 是 | 查询者ID |
| role_id | number | 是 | 查询者角色ID (0学生,1教师,2管理员) |
| find_id | number | 否 | 要查询的角色ID (0学生,1教师,2管理员)，如不提供则根据查询者角色返回相应列表 |

### 响应内容
```json
{
  "code": 200,
  "message": "获取用户列表成功",
  "data": [
    {
      "userId": 1,
      "username": "用户1",
      "email": "邮箱1",
      "roleId": 0
    },
    {
      "userId": 2,
      "username": "用户2",
      "email": "邮箱2",
      "roleId": 0
    }
  ]
}
```

### 错误响应
| 错误码 | 说明 |
| --- | --- |
| 400 | 参数错误，缺少必要参数或角色ID不正确 |
| 401 | 查询者不存在 |
| 403 | 权限不足或查询者角色不匹配 |
| 500 | 服务器错误 |

### 重要说明
1. 学生只能查看自己的信息
2. 教师可以查看所有学生的信息和自己的信息
   - 如果指定 find_id=0，则只返回学生列表
   - 如果指定 find_id=1，则只返回自己的信息
   - 如果不指定 find_id，则返回所有学生和自己的信息
3. 管理员可以查看所有人的信息
   - 如果指定 find_id，则只返回该角色的用户列表
   - 如果不指定 find_id，则返回所有用户
4. 返回的用户信息中不包含密码字段

## 状态码说明
- 200: 成功
- 400: 请求参数错误
- 401: 未授权或认证失败
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 角色说明
- 0: 学生
- 1: 教师
- 2: 管理员

## 问题状态说明
- 0: 未完成
- 1: 错误
- 2: 正确