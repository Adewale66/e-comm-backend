import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Otp {
  @PrimaryColumn()
  code: string;

  @Column()
  expiresIn: Date;
}
