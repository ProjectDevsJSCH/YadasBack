import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from 'src/decorators/roles/roles.guard';
import { AuthConstants } from '../auth/auth.constants';
import { UserService } from './user.service';

@ApiTags('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
    ) { }

    @Get('/all')
    getAllUsers() {
        return this.userService.getUserList();
    }
}
