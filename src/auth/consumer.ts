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

      const emailContent = `
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; 
      border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
          <div style="text-align: center; background-color: #4CAF50; padding: 10px 0; 
          color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 18px; color: #333333;">Hello ${job.data.name},</p>
            <p style="font-size: 18px; color: #333333;">
            You have requested to reset your password for your e-commerce account.
            Please use the code below to reset your password:
            </p>
            <div style="font-size: 36px; font-weight: bold; background-color: #f1f1f1; 
            padding: 10px; margin: 20px auto; width: fit-content; border-radius: 5px; letter-spacing: 5px; 
            text-align: center;">${job.data.code}</div>
            <p style="font-size: 18px; color: #333333;">This OTP is valid for the next 30 seconds.</p>
            <p style="font-size: 18px; color: #333333;">
            If you did not request a password reset, please ignore this email or contact support.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #999999; font-size: 14px;">
            <p>Thank you for shopping with us!</p>
            <p>Need help? <a href="javascript:void(0)" style="color: #4CAF50; text-decoration: none;">
            Contact Support</a></p>
          </div>
        </div>
      `;

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
