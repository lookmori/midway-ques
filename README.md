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

## API 接口文档

### 1. 用户认证接口

#### 1.1 用户登录
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
    "user_id": "number",  // 用户ID
    "username": "string", // 用户名
    "email": "string",    // 邮箱
    "role_id": "number"   // 角色ID
  } | null
}
```

#### 1.2 用户注册
- 请求路径：`POST /api/register`
- 请求参数：
```json
{
  "email": "string",      // 邮箱
  "password": "string",   // 密码（长度不少于6位）
  "role_id": "number",    // 角色ID (0学生,1教师,2管理员)
  "code": "string"        // 邮箱验证码
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

#### 1.3 重置密码
- 请求路径：`POST /api/reset-password`
- 请求参数：
```json
{
  "email": "string",       // 邮箱
  "code": "string",        // 验证码
  "newPassword": "string"  // 新密码（长度不少于6位）
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

### 2. 用户管理接口

#### 2.1 添加教师
- 请求路径：`POST /api/teachers`
- 请求参数：
```json
{
  "username": "string",   // 用户名（必填）
  "email": "string",      // 邮箱（必填，必须唯一）
  "password": "string",   // 密码（必填，长度不少于6位）
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
    "role_id": 1         // 角色ID（固定为1，表示教师）
  } | null
}
```

#### 2.2 添加学生
- 请求路径：`POST /api/students`
- 请求参数：
```json
{
  "username": "string",   // 用户名（必填）
  "email": "string",      // 邮箱（必填，必须唯一）
  "password": "string",   // 密码（必填，长度不少于6位）
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
    "role_id": 0         // 角色ID（固定为0，表示学生）
  } | null
}
```

#### 2.3 删除用户
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

#### 2.4 修改用户信息
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

#### 2.5 获取用户信息
- 请求路径：`POST /api/get-user-info`
- 请求参数：
```json
{
  "user_id": "number",    // 查询者ID
  "role_id": "number",    // 查询者角色ID
  "find_id": "number"     // 要查询的角色ID（可选）
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
  }[] | null
}
```

### 3. 问题管理接口

#### 3.1 获取问题列表
- 请求路径：`GET /api/problems`
- 请求参数：
```json
{
  "user_id": "number",    // 用户ID
  "role_id": "number",    // 角色ID
  "problem_id": "number"  // 问题ID（可选，如果提供则只返回该问题）
}
```
- 响应内容：
  - 学生角色 (role_id=0) 返回：
  ```json
  {
    "code": "number",       // 状态码
    "message": "string",    // 消息
    "data": [{
      "problem_id": "number",     // 问题ID
      "title": "string",          // 问题标题
      "detail": "string",         // 问题详情
      "example_input": "string",  // 示例输入
      "example_output": "string", // 示例输出
      "ques_tag": "string",       // 知识点标签
      "status": "number",         // 状态（-1:错误, 0:未完成, 1:正确, 2:错误）
      "submit_count": "number",   // 提交次数
      "submission_time": "string" // 提交时间，精确到日（格式：YYYY-MM-DD，未提交为null）
    }]
  }
  ```
  
  - 教师/管理员角色 (role_id=1或2) 返回：
  ```json
  {
    "code": "number",       // 状态码
    "message": "string",    // 消息
    "data": [{
      "problem_id": "number",     // 问题ID
      "title": "string",          // 问题标题
      "detail": "string",         // 问题详情
      "example_input": "string",  // 示例输入
      "example_output": "string", // 示例输出
      "answer": "string",         // 问题答案
      "ques_tag": "string",       // 知识点标签
      "status": "number",         // 状态（默认为0）
      "submit_count": "number",   // 提交次数（默认为0）
      "submission_time": "string" // 提交时间，精确到日（未提交为null）
    }]
  }
  ```

#### 3.2 提交答案
- 请求路径：`POST /api/problems/submit`
- 请求参数：
```json
{
  "user_id": "number",       // 用户ID
  "role_id": "number",       // 角色ID
  "problem_id": "number",    // 问题ID
  "student_answer": "string", // 学生提交的答案
  "problem_desc": "string",  // 可选，题目描述，如果不提供则使用数据库中的题目
  "submission_time": "string" // 可选，提交时间，格式：YYYY-MM-DD，如果不提供则使用服务器当前日期
}
```
- 响应内容：
```json
{
  "code": "number",          // 状态码
  "message": "string",       // 消息
  "data": {
    "problem_id": "number",  // 问题ID
    "status": "number",      // 状态（0:未完成，1:正确，2:错误）
    "is_correct": "boolean", // 是否正确
    "error_message": "string", // 错误消息（可选）
    "submission_time": "string" // 提交时间，格式：YYYY-MM-DD
  }
}
```

#### 3.3 导入问题
- 请求路径：`POST /api/problems/import`
- 请求参数：
```json
{
  "problems": [
    {
      "ques_name": "string",      // 问题名称（必填）
      "ques_desc": "string",      // 问题详细描述（必填）
      "ques_in": "string",        // 示例输入（可选）
      "ques_out": "string",       // 示例输出（可选）
      "ques_ans": "string",       // 问题的答案（可选，默认为空字符串）
      "ques_tag": "string"        // 知识点标签（可选，默认为null）
    }
  ],
  "role_id": "number"            // 操作者角色ID（必须是教师或管理员）
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
        "title": "string",       // 问题标题
        "ques_tag": "string"     // 知识点标签（可选）
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

#### 3.4 删除问题
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

### 4. 状态码说明
- 200: 请求成功
- 400: 请求参数错误（参数缺失、格式错误等）
- 401: 未授权（未登录或token无效）
- 403: 权限不足（无权执行该操作）
- 404: 资源不存在
- 500: 服务器内部错误

### 5. 角色说明
- 0: 学生
- 1: 教师
- 2: 管理员

### 6. 问题状态说明
- 0: 未完成/评判系统错误
- 1: 正确
- 2: 错误

## 部署指南

### 1. 环境要求

- Node.js >= 16
- MySQL >= 5.7
- Nginx
- PM2
- Linux/Unix 系统（推荐 Ubuntu 20.04 LTS）

### 2. 系统准备

```bash
# 更新系统包
sudo apt update
sudo apt upgrade

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装 PM2
npm install -g pm2
```

### 3. 项目部署

#### 3.1 获取代码

```bash
# 克隆项目
git clone <项目地址>
cd midway-ques

# 安装依赖
npm install

# 构建项目
npm run build
```

#### 3.2 配置环境变量

项目使用 `.env` 文件管理环境变量，确保以下配置正确：

```env
# 服务器配置
PORT=7001

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=pyques_user  # 使用专用数据库用户，不要使用root
DB_PASSWORD=your_password
DB_DATABASE=py_ques
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h

# 邮件服务配置
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_email_password

# 验证码配置
VERIFICATION_CODE_EXPIRE_TIME=300
```

#### 3.3 数据库配置 (宝塔面板)

1. **创建数据库和用户**：
   - 登录宝塔面板
   - 进入"数据库"模块
   - 点击"添加数据库"
   - 填写信息：
     - 数据库名：`py_ques`
     - 用户名：`pyques_user`（或您喜欢的名称）
     - 密码：设置一个强密码
     - 访问权限：根据需要选择
   - 点击"提交"创建

2. **导入数据库结构**：
   - 在宝塔面板的数据库列表找到 `py_ques` 数据库
   - 点击"导入"按钮
   - 上传 `create_tables.sql` 文件并导入
   
   或使用命令行：
   ```bash
   mysql -u pyques_user -p py_ques < create_tables.sql
   ```

3. **确认数据库配置**：
   确保 `.env` 文件中的数据库配置与你在宝塔面板创建的信息匹配。

#### 3.4 PM2 配置

创建 PM2 配置文件 \`ecosystem.config.js\`：

```javascript
module.exports = {
  apps: [{
    name: 'midway-ques',
    script: 'bootstrap.js',
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 7001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 7001
    }
  }]
};
```

启动应用：
```bash
pm2 start ecosystem.config.js
```

#### 3.5 Nginx 配置 (宝塔面板)

1. **创建网站**：
   - 在宝塔面板中，进入"网站"模块
   - 点击"添加站点"
   - 填写域名：`www.code.lookmori.cn`
   - 选择根目录（通常是 `/www/wwwroot/www.code.lookmori.cn`）
   - 其他选项根据需要配置

2. **修改网站配置**：
   - 找到创建的站点，点击"设置"
   - 选择"配置文件"
   - 将配置修改为以下内容：

```nginx
server {
    listen 80;
    server_name www.code.lookmori.cn code.lookmori.cn;

    # 日志配置
    access_log /www/wwwlogs/code.lookmori.cn.access.log;
    error_log /www/wwwlogs/code.lookmori.cn.error.log;

    # 反向代理配置
    location / {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 安全配置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 性能优化
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    gzip_proxied any;
}
```

3. **保存配置并重启 Nginx**：
   - 点击"保存"按钮
   - 在宝塔面板中重启 Nginx 服务

### 4. SSL 证书配置 (宝塔面板)

1. **申请 SSL 证书**：
   - 在宝塔面板中，找到创建的站点
   - 点击"设置" -> "SSL"
   - 选择"Let's Encrypt"，填写邮箱
   - 勾选需要的域名（www.code.lookmori.cn 和 code.lookmori.cn）
   - 点击"申请"获取证书

2. **启用 HTTPS**：
   - 证书申请成功后，开启"强制HTTPS"选项
   - 点击"保存"应用更改

### 5. 常用维护命令

#### PM2 命令
```bash
pm2 status                # 查看应用状态
pm2 logs                  # 查看日志
pm2 restart ecosystem.config.js  # 重启应用
pm2 reload ecosystem.config.js   # 零停机重载
pm2 delete ecosystem.config.js   # 删除应用
pm2 monit                 # 监控应用
```

#### 日志查看
```bash
# Nginx 日志
tail -f /www/wwwlogs/code.lookmori.cn.error.log
tail -f /www/wwwlogs/code.lookmori.cn.access.log

# 应用日志
pm2 logs midway-ques
```

### 6. 故障排查

1. **应用无法启动**：
   - 检查环境变量配置
   - 检查 PM2 日志
   - 确认数据库连接正常

2. **数据库连接失败**：
   - 验证数据库用户名和密码
   - 确认数据库是否存在
   - 检查数据库用户权限

3. **域名无法访问**：
   - 检查 DNS 解析是否生效
   - 确认 Nginx 配置正确
   - 查看 Nginx 错误日志

4. **SSL 证书问题**：
   - 确认证书是否过期
   - 检查证书配置
   - 重新申请证书

### 7. 安全建议

1. **服务器安全**：
   - 使用强密码
   - 定期更新系统
   - 配置防火墙

2. **应用安全**：
   - 使用环境变量存储敏感信息
   - 启用 HTTPS
   - 配置适当的文件权限

3. **数据库安全**：
   - 不使用 root 用户连接数据库
   - 限制数据库访问IP
   - 定期备份数据

### 8. 备份策略

1. **数据库备份**：
   - 使用宝塔面板的数据库备份功能定期备份
   - 或创建定时备份脚本：
   ```bash
   # 创建备份脚本
   mysqldump -u pyques_user -p py_ques > backup_$(date +%Y%m%d).sql
   ```

2. **配置文件备份**：
   - 定期备份 .env 文件
   - 备份 Nginx 配置
   - 备份 SSL 证书

## 技术支持

如遇到部署问题，请联系技术支持或提交 Issue。