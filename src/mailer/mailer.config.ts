import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

const MAILER_CONFIG: MailerOptions = {
    transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            type: 'OAuth2',
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        },
    },
    template: {
        dir: path.join(process.env.PWD, '/src/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
            strict: true,
        },
    },
};

export default MAILER_CONFIG;
