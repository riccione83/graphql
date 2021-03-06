import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @Column()
  title!: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  imagePath?: string;

  @Field(() => Int)
  @Column({ nullable: true })
  userId!: number;

  @ManyToOne(() => User, (user) => user.posts, { nullable: true })
  user: User;
}
