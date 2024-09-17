import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { Product } from '../../products/entities/product.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryColumn()
  userId: string;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  products: CartItem[];

  @Column('decimal')
  total: number;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
