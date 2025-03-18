import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('verification_code')
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '邮箱',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 6,
    comment: '验证码',
  })
  code: string;

  @Column({
    type: 'datetime',
    comment: '过期时间',
  })
  expireAt: Date;

  @CreateDateColumn({
    type: 'datetime',
    comment: '创建时间',
  })
  createdAt: Date;
} 