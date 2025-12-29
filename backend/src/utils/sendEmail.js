import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  }
});


export const sendVerificationEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};


const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmailResend = async ({ to, subject, html }) => {
  await resend.emails.send({
    from: "Go Cinema <quoclep2003@gmail.com>",
    to,
    subject,
    html,
  });
};