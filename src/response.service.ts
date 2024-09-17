import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
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
