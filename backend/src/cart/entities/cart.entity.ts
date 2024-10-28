import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryColumn()
  userId: string;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  products: CartItem[];

  @Column('decimal', {
    default: 0.0,
    precision: 10,
    scale: 2,
  })
  total: number;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
