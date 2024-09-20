import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.products)
  cart: Cart;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'int', unsigned: true })
  quantity: number;
}
