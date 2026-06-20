import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'text', nullable: true, unique: true })
  yandexId: string | null;
}
