import { Module, CacheModule } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';

import MAIN_DB_CONFIG from './database/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { DataBaseModule } from './database/database.module';
import { InventoryConfigModule } from './modules/inventory-config/inventory-config.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { NotificationTasksModule } from './modules/notifications/task/notification-task.module';
import { LoggerModule } from './modules/logger/logger.module';
import { RolesModule } from './modules/roles/roles.module';
import { EnterpriseModule } from './modules/enterprise/enterprise.module';
import { InvenotryViewTasksModule } from './modules/inventory/task/inventory-task.module';
import { RoutesModule } from './modules/routes/routes.module';
import { RolesEnterpriseModule } from './modules/roles-enterprise/roles-enterprise.module';
import { UserTaskModule } from './modules/user/task/user-task.module';
import MAILER_CONFIG from './mailer/mailer.config';
import { InventoryConfigTaskModule } from './modules/inventory-config/task/inventory-config-task.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(MAIN_DB_CONFIG),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MailerModule.forRoot(MAILER_CONFIG),
        CacheModule.register(),
        AuthModule,
        UserModule,
        InventoryModule,
        DataBaseModule,
        InventoryConfigModule,
        NotificationsModule,
        NotificationTasksModule,
        InvenotryViewTasksModule,
        RolesModule,
        EnterpriseModule,
        RoutesModule,
        ScheduleModule.forRoot(),
        LoggerModule,
        RolesEnterpriseModule,
        UserTaskModule,
        InventoryConfigTaskModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
