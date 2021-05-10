import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as config from 'config';
import { AppModule } from './app.module';
import { AuthConstants } from './modules/auth/auth.constants';

const SWAGGER_CONFIG = config.get('swagger') as any;
const SERVER_CONFIG = config.get('server') as any;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    /* Swagger configuration */
    const options = new DocumentBuilder()
        .setTitle(SWAGGER_CONFIG.title)
        .setDescription(SWAGGER_CONFIG.description)
        .setVersion(SWAGGER_CONFIG.version)
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            AuthConstants.ACCESS_TOKEN_NAME,
        )
        .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT || SERVER_CONFIG.port);
}
bootstrap();
