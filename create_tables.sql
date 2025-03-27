-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS py_ques CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE py_ques;

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS user_problem;
DROP TABLE IF EXISTS verification_code;
DROP TABLE IF EXISTS problem;
DROP TABLE IF EXISTS user;

-- 创建用户表
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  role_id TINYINT NOT NULL DEFAULT 0 COMMENT '角色ID (0=学生, 1=教师, 2=管理员)',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 创建问题表
CREATE TABLE problem (
  problem_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '问题ID',
  title VARCHAR(255) NOT NULL COMMENT '问题标题',
  detail TEXT NOT NULL COMMENT '问题详情',
  example_input TEXT COMMENT '示例输入',
  example_output TEXT COMMENT '示例输出',
  answer TEXT COMMENT '问题答案',
  ques_tag VARCHAR(50) COMMENT '知识点标签',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题表';

-- 创建用户-问题关联表
CREATE TABLE user_problem (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  user_id INT NOT NULL COMMENT '用户ID',
  problem_id INT NOT NULL COMMENT '问题ID',
  student_answer TEXT COMMENT '学生答案',
  status TINYINT NOT NULL DEFAULT 0 COMMENT '状态 (0=未完成/系统错误, 1=正确, 2=错误)',
  submit_count INT NOT NULL DEFAULT 1 COMMENT '提交次数',
  submission_time DATE COMMENT '提交时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problem(problem_id) ON DELETE CASCADE,
  UNIQUE KEY user_problem_unique (user_id, problem_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-问题关联表';

-- 创建验证码表
CREATE TABLE verification_code (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '验证码ID',
  email VARCHAR(100) NOT NULL COMMENT '邮箱',
  code VARCHAR(10) NOT NULL COMMENT '验证码',
  expire_at TIMESTAMP NOT NULL COMMENT '过期时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  KEY email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码表';

-- 创建初始管理员账户
INSERT INTO user (username, email, password, role_id) VALUES 
('admin', 'admin@example.com', '$2a$10$5pPDk5nz6Q5F.gEhJ3QpNOH0bEX84sJcXlS15FVGI9vX9DqZ1XvCe', 2);
-- 密码为 'admin123'，已经使用 bcrypt 加密

-- 插入示例题目
INSERT INTO problem (title, detail, example_input, example_output, answer, ques_tag) VALUES
('计算两个数的和', '编写一个函数，计算两个输入数字的和。\n\n函数声明：\n```python\ndef add(a, b):\n    # 你的代码\n```', '输入：add(5, 3)', '输出：8', 'def add(a, b):\n    return a + b', 'basic'),
('判断奇偶数', '编写一个函数，判断一个数是奇数还是偶数。\n\n函数声明：\n```python\ndef is_even(num):\n    # 你的代码\n```\n返回True表示偶数，False表示奇数。', '输入：is_even(4)\n输入：is_even(7)', '输出：True\n输出：False', 'def is_even(num):\n    return num % 2 == 0', 'conditional'),
('计算阶乘', '编写一个函数，计算一个非负整数的阶乘。\n\n函数声明：\n```python\ndef factorial(n):\n    # 你的代码\n```', '输入：factorial(5)', '输出：120', 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)', 'recursion'); 