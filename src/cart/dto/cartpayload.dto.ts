import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CartPayloadDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
