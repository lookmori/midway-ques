"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path_1 = require("path");
const user_entity_1 = require("../src/entity/user.entity");
// 加载环境变量
dotenv.config();
async function createAdmin() {
    console.log('开始创建管理员用户...');
    try {
        // 创建数据库连接
        const connection = await (0, typeorm_1.createConnection)({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '3364487975lfp.',
            database: process.env.DB_DATABASE || 'py_ques',
            entities: [(0, path_1.join)(__dirname, '../src/entity/*.entity{.ts,.js}')],
            synchronize: true,
        });
        console.log('数据库连接成功');
        // 检查用户是否已存在
        const userRepository = connection.getRepository(user_entity_1.User);
        const existingUser = await userRepository.findOne({ where: { email: 'v18338258072@136.com' } });
        if (existingUser) {
            console.log('用户已存在，无需创建');
            await connection.close();
            return;
        }
        // 创建新用户
        const hashedPassword = await bcrypt.hash('123456789', 10);
        const user = new user_entity_1.User();
        user.email = 'v18338258072@136.com';
        user.username = `admin_${Date.now()}`;
        user.password = hashedPassword;
        user.roleId = 2; // 管理员角色
        // 保存用户
        await userRepository.save(user);
        console.log('管理员用户创建成功:', user);
        // 关闭连接
        await connection.close();
        console.log('数据库连接已关闭');
    }
    catch (error) {
        console.error('创建管理员用户失败:', error);
    }
}
// 执行创建管理员函数
createAdmin().catch(error => {
    console.error('脚本执行失败:', error);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWFkbWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLWFkbWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQTJDO0FBQzNDLG1DQUFtQztBQUNuQyxpQ0FBaUM7QUFDakMsK0JBQTRCO0FBQzVCLDJEQUFpRDtBQUVqRCxTQUFTO0FBQ1QsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLEtBQUssVUFBVSxXQUFXO0lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFNUIsSUFBSTtRQUNGLFVBQVU7UUFDVixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEsMEJBQWdCLEVBQUM7WUFDeEMsSUFBSSxFQUFFLE9BQU87WUFDYixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksV0FBVztZQUN4QyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ2hFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNO1lBQzNDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxnQkFBZ0I7WUFDckQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLFNBQVM7WUFDOUMsUUFBUSxFQUFFLENBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7WUFDOUQsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV2QixZQUFZO1FBQ1osTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxrQkFBSSxDQUFDLENBQUM7UUFDdEQsTUFBTSxZQUFZLEdBQUcsTUFBTSxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWhHLElBQUksWUFBWSxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsTUFBTSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsT0FBTztTQUNSO1FBRUQsUUFBUTtRQUNSLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxrQkFBSSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQztRQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRO1FBRXpCLE9BQU87UUFDUCxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEMsT0FBTztRQUNQLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDekI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3BDO0FBQ0gsQ0FBQztBQUVELFlBQVk7QUFDWixXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDMUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDLENBQUMifQ==