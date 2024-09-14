import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('reset email')
export class ResetConsumer extends WorkerHost {
  constructor(private readonly configService: ConfigService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'reset': {
        this.sendEmail(job);
        return {};
      }
    }
  }

  private async sendEmail(job: Job<any, any, string>) {
    const email = this.configService.get('EMAIL_USER');
    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get('EMAIL_HOST'),
        port: +this.configService.get('EMAIL_PORT'),
        auth: {
          user: email,
          pass: this.configService.get('EMAIL_PASS'),
        },
      });

      const emailContent = `<p>This email was sent as part of the password reset process
        for ${job.data.email} on E-Commerce website if this was
        not initiated by you then ignore this emailContent</p>
        <p>Your verification code is: <strong> ${job.data.code}</strong></p>`;

      const info = await transporter.sendMail({
        from: `"E-Commerce" ${email}`,
        to: `${job.data.email}`,
        subject: 'Verification Code',
        html: emailContent,
      });

      Logger.log(`Email sent to ${job.data.email} with id ${info.messageId}`);
    } catch (error) {
      Logger.log('Failed to send email.', error);
    }
  }
}
