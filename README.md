# Python 在线编程系统 API 文档

## 基础信息
- 基础URL: `http://localhost:7001`
- 所有请求都需要设置 `Content-Type: application/json` 请求头
- 除了登录和注册接口外，其他接口都需要在请求头中携带 `Authorization: Bearer <token>`

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
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "username": "string", // 用户名
    "email": "string",    // 邮箱
    "role_id": "number",  // 角色ID
    "token": "string"     // JWT令牌
  } | null
}
```

#### 1.3 用户注册
- 请求路径：`POST /api/register`
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
  "student_answer": "string"  // 学生答案
}
```
- 响应内容：
```json
{
  "code": "number",       // 状态码
  "message": "string",    // 消息
  "data": {
    "problem_id": "number", // 问题ID
    "status": "number"     // 状态
  } | null
}
```

### 3. 用户管理接口

#### 3.1 添加教师
- 请求路径：`POST /api/teachers`
- 请求参数：
```json
{
  "user_id": "number",    // 用户ID
  "role_id": "number"     // 操作者角色ID
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

#### 3.2 添加学生
- 请求路径：`POST /api/students`
- 请求参数：
```json
{
  "user_id": "number",    // 用户ID
  "role_id": "number"     // 操作者角色ID
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
- -1: 错误
- 0: 未完成
- 1: 正确

## 使用示例

### JavaScript 示例代码

```javascript
// 登录请求
async function login() {
  const response = await fetch('http://localhost:7001/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'example@email.com',
      password: 'password123',
      role_id: 0
    })
  });
  
  const result = await response.json();
  if (result.code === 200) {
    localStorage.setItem('token', result.data.token);
  }
  return result;
}

// 获取问题列表
async function getProblems() {
  const response = await fetch('http://localhost:7001/api/problems', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      user_id: 1,
      role_id: 0
    })
  });
  
  return await response.json();
}
```
