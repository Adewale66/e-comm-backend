import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  success(message: string, data?: any) {
    return {
      succeeded: true,
      statusCode: HttpStatus.OK,
      message,
      data,
    };
  }
}
