import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../decorators';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  findAll(@Query('category') category: string, @Query('page') page: string) {
    return this.productsService.findAll(category, page);
  }

  @Get(':tag')
  @Public()
  findOne(@Param('tag') tag: string) {
    return this.productsService.findOne(tag);
  }
}
