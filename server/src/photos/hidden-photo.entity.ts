import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class HiddenPhoto {
  @PrimaryColumn()
  photoId: string;

  @Column({ type: 'text', nullable: true })
  hiddenBy: string | null;

  @CreateDateColumn()
  hiddenAt: Date;
}
