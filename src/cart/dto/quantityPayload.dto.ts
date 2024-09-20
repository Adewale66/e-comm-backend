import { IsNotEmpty, IsNumber } from 'class-validator';

export class QuantityPayloadDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
