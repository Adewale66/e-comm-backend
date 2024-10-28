import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Like, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  findAll(category: string, page: string) {
    return category
      ? this.productRepository.find({
          where: {
            category: Like(`${category}%`),
          },
          take: 8,
          skip: (parseInt(page || '1') - 1) * 8,
        })
      : this.productRepository.find({
          take: 8,
          skip: (parseInt(page || '1') - 1) * 8,
        });
  }

  async findOne(tag: string) {
    return await this.productRepository.findOneBy({ tag });
  }

  async findById(id: string) {
    return await this.productRepository.findOneBy({ id });
  }

  async findByIds(ids: string[]) {
    return await this.productRepository.findBy({
      id: In(ids),
    });
  }
}
