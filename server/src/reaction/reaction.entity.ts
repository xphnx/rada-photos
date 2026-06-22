import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from '../user/user.entity';

@Entity()
@Unique(['photoId', 'user'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  photoId: string;

  @Column()
  type: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
