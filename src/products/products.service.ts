import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  findAll(category: string) {
    return category
      ? this.productRepository.find({
          where: {
            category: Like(`${category}%`),
          },
        })
      : this.productRepository.find();
  }

  async findOne(id: string) {
    return await this.productRepository.findOneBy({ id });
  }
}
