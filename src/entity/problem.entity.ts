import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserProblem } from './user-problem.entity';

@Entity('problem')
export class Problem {
  @PrimaryGeneratedColumn({ name: 'problem_id' })
  problemId: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '问题标题',
  })
  title: string;

  @Column({
    type: 'text',
    comment: '问题详情',
  })
  detail: string;

  @Column({
    name: 'example_input',
    type: 'text',
    nullable: true,
    comment: '示例输入',
  })
  exampleInput: string;

  @Column({
    name: 'example_output',
    type: 'text',
    nullable: true,
    comment: '示例输出',
  })
  exampleOutput: string;

  @Column({
    name: 'answer',
    type: 'text',
    nullable: true,
    comment: '问题答案',
  })
  answer: string;

  @Column({
    name: 'ques_tag',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '问题知识点标签',
  })
  quesTag: string;

  @OneToMany(() => UserProblem, userProblem => userProblem.problem)
  userProblems: UserProblem[];
} 