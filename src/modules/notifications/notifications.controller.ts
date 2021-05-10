import {
    Controller, Get, Header, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as CacheTime from 'src/cache/cache-time';

import { AuthConstants } from '../auth/auth.constants';
import { NotificationWithProduct } from './dto/notification-with-product.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('notifications')
export class NotificationsController {
    constructor(
        private notificationsService: NotificationsService,
    ) { }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_HOUR}`)
    @Get()
    getNotifications(): Promise<NotificationWithProduct[]> {
        return this.notificationsService.getNotifications();
    }
}
