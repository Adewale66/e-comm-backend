import { ValidateNested } from 'class-validator';
import { CartPayloadDto } from './cartpayload.dto';

export class BulkDto {
  @ValidateNested({ each: true })
  products: CartPayloadDto[];
}
