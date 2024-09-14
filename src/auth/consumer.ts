import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('reset email')
export class ResetConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'reset': {
        this.sendEmail(job);
        return {};
      }
    }
  }

  private async sendEmail(job: Job<any, any, string>) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          user: 'stephen@holmes.com.ng',
          pass: 'Pa55w.rd',
        },
      });

      const emailContent = `<p>This email was sent as part of the password reset process
        for ${job.data.email} on E-Commerce website if this was
        not initiated by you then ignore this emailContent</p>
        <p>Your verification code is: <strong> ${job.data.code}</strong></p>`;

      const info = await transporter.sendMail({
        from: '"E-Commerce" <stephen@holmes.com.ng>',
        to: `${job.data.email}`,
        subject: 'Verification Code',
        html: emailContent,
      });

      console.log(`Email sent to ${job.data.email} with id ${info.messageId}`);
    } catch (error) {
      console.log('Failed to send email.', error);
    }
  }
}
