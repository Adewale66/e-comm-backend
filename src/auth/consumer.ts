import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('reset email')
export class ResetConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'reset': {
        console.log(job.data.email, job.data.code);
        console.log('send email here	');
        return {};
      }
    }
  }
}
