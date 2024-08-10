import { createTransport } from "nodemailer";

export async function sendEmailMessage({
  message,
  to,
  from,
  subject,
  attachments,
  useHTML,
}: {
  message: string;
  to: string;
  from: string;
  subject: string;
  attachments: {
    filename: string;
    path: string;
    cid: string;
  }[];
  useHTML?: boolean;
}) {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    //   secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PWD,
    },
  });

  let emailOpts = {
    from, // sender address
    to, // list of receivers
    subject, // Subject line
    attachments,
  } as any;

  if (useHTML) {
    emailOpts.html = message;
  } else {
    emailOpts.text = message;
  }
  const info = await transporter.sendMail(emailOpts);

  return info;
}
