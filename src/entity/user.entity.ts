import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserProblem } from './user-problem.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: '邮箱',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '密码',
  })
  password: string;

  @Column({
    name: 'role_id',
    type: 'int',
    default: 0,
    comment: '角色ID (0学生,1教师,2管理员)',
  })
  roleId: number;

  @OneToMany(() => UserProblem, userProblem => userProblem.user)
  userProblems: UserProblem[];
} 