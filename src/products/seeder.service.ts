import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

type productSchema = {
  id: string;
  title: string;
  price: string;
  description: string;
  category: string;
  image: string;
};

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}
  async seed() {
    const [, length] = await this.productRepository.findAndCount();
    if (length != 0) {
      console.log('Database seeding not required');
      return;
    }
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const seedData: productSchema[] = await response.json();
      for (const data of seedData) {
        await this.productRepository.save({
          ...data,
          price: parseFloat(data.price) * 100,
        });
      }
    } catch (err) {
      console.log('Network error ', err);
    } finally {
      console.log('Seeding complete');
    }
  }
}
