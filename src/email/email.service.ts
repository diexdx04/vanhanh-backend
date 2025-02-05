import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendWelcomeEmail(to: string, verifiCode: string) {
    console.log(333, verifiCode);

    const verificationLink = `http://localhost:3001/verification?verifyToken=${verifiCode}`;
    const mailOptions = {
      from: `"VanHanh" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Welcome to VanHanh!',
      text: 'Cam on ban da su dng vanHanh!Vui Long xac minh tai khoan!!',
      html: `
        <p>Cam on ban da su dung vanHanh!</p>
        <p>Vui long xac thuc tai khoan bang cach an nut duoi day:</p>
        <a href="${verificationLink}" target="_self"; style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; ">Xác thực tài khoản</a>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }
}
