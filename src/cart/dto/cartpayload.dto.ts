import { IsNotEmpty, IsString } from 'class-validator';

export class CartPayloadDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
