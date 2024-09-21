import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CartPayloadDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
