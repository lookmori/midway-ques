import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Problem } from './problem.entity';

@Entity('user_problem')
export class UserProblem {
  @Column({
    name: 'problem_id',
    primary: true,
    comment: '问题ID',
  })
  problemId: number;

  @Column({
    name: 'user_id',
    primary: true,
    comment: '用户ID',
  })
  userId: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '状态 (-1错误,0未完成,1正确)',
  })
  status: number;

  @Column({
    name: 'student_answer',
    type: 'text',
    nullable: true,
    comment: '学生提交的答案',
  })
  studentAnswer: string;

  @ManyToOne(() => Problem, problem => problem.userProblems)
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;

  @ManyToOne(() => User, user => user.userProblems)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 