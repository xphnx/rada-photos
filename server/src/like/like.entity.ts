import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '../user/user.entity';

@Entity('likes')
@Unique(['photoId', 'user'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  photoId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
