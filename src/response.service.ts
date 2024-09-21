import { HttpStatus } from '@nestjs/common';

type ProductInfo = {
  productId: string;
  image: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export class ResponseService {
  private status: HttpStatus;
  private message: string;
  private data?: object;

  constructor(status: HttpStatus, message: string, data?: object) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  getStatus(): number {
    return this.status;
  }
}

export class CartResponse {
  private message: string;
  private total: number;
  products: ProductInfo[];

  constructor(message: string, total: number, products: ProductInfo[]) {
    this.message = message;
    this.total = total;
    this.products = products;
  }
}
