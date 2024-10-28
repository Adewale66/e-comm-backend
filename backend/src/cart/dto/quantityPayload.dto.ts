import { CartPayloadDto } from './cartpayload.dto';
import { OmitType } from '@nestjs/swagger';

export class QuantityPayloadDto extends OmitType(CartPayloadDto, [
  'productId',
]) {}
