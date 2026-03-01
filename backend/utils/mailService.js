


const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const environment = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${environment}` });

const host = process.env.HOST;
const port = process.env.MAIL_PORT;
const senderMAil = process.env.SENDER_MAIL_ID;
const senderPassword = process.env.SENDER_MAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  host: host,
  port: port,
  secure: false,
  auth: {
    user: senderMAil,
    pass: senderPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;