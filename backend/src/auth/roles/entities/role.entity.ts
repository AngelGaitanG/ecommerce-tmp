import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role as RoleEnum } from '../enums/role.enum';
import { v4 as uuidv4 } from 'uuid';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ 
    type: 'enum', 
    enum: RoleEnum,
    unique: true 
  })
  name: RoleEnum;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}