import { CartPayloadDto } from './cartpayload.dto';
import { OmitType } from '@nestjs/mapped-types';

export class QuantityPayloadDto extends OmitType(CartPayloadDto, [
  'productId',
]) {}
