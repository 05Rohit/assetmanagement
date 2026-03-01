

const cron = require("node-cron");
const User = require("./../model/user");
const Transporter = require("./mailService");
const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${environment}` });

const senderMAil = process.env.SENDER_MAIL_ID;
const cronMiddleware = () => {
  cron.schedule("00 00 10 * * *", async () => {
    // cron.schedule("* * * * * *", async () => {
    try {
      const today = new Date();
      today.setUTCHours(0);
      today.setUTCMinutes(0);
      today.setUTCSeconds(0);
      today.setUTCMilliseconds(0);
      today.setDate(today.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setUTCHours(0);
      tomorrow.setUTCMinutes(0);
      tomorrow.setUTCSeconds(0);
      tomorrow.setUTCMilliseconds(0);
      tomorrow.setDate(tomorrow.getDate());

      tomorrow.setDate(tomorrow.getDate() + 1);
      const users = await User.find({
        serviceEndDate: {
          $gte: today,
          $lte: tomorrow,
        },
        status: true,
        role: "vendor",
      });

      for (const user of users) {
        user.status = false;
        await user.save();
        const mailOptions = {
          from: {
            name: "SmarTE Desk",
            address: `${senderMAil}`,
          },
          to: `${user.email}`,
          bcc: "smartrims@tataelxsi.co.in",
          subject: "Your Account is deactivated",
          html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1;
                color: #333;
                margin: 5px;
                font-size:12px
            }
            h1, h2 {
                color: #0056b3;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
            }
            table, th, td {
                border: 1px solid #ddd;
            }
            td {
                padding: 4px;
                text-align: left;
            }
            th {
                padding: 5px;
            }
            th {
                background-color: #f4f4f4;
            }
            .footer {
                font-size: 0.9em;
                color: #777;
            }
             div{
              margin:2px
              }
        </style>
    </head>
    <body>
        <p>Hi ${user.name},</p>
        <p>Your Account is deactivated, as your service expired today.</p>
        <p>
        <div>Regards,</div>
        <div> Team smarTE Desk
        </div>
        </p>
        <p class="footer"><strong>This is a system generated mail, please do not reply to this mail.</strong></p>
    </body>
    </html>
    `,
        };

        Transporter.sendMail(mailOptions);
      }
    } catch (error) {
      console.error("Error in cron job:", error);
    }
  });
};

module.exports = cronMiddleware;