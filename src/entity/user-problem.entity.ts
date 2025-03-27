import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Problem } from './problem.entity';

@Entity('user_problem')
export class UserProblem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'problem_id',
    comment: '问题ID',
  })
  problem_id: number;

  @Column({
    name: 'user_id',
    comment: '用户ID',
  })
  user_id: number;

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
  student_answer: string;

  @Column({
    name: 'submission_time',
    type: 'date',
    nullable: true,
    comment: '提交时间，精确到日',
  })
  submission_time: Date;

  @ManyToOne(() => Problem, problem => problem.user_problems)
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;

  @ManyToOne(() => User, user => user.user_problems)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 