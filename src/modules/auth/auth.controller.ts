import {
    Controller, Body, Post, ValidationPipe, UsePipes, UseGuards, Patch, Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from 'src/decorators/roles/roles.guard';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { GetUser } from 'src/modules/user/get-user.decorator';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthToken } from './auth-token.interface';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { UserRolValidationPipe } from './user-rol-validation.pipe';
import { SetPassowrdDto } from './dto/set-password.dto';
import { User } from '../user/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthConstants } from './auth.constants';

@ApiTags('Authentication')
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Post('/signup')

    @UsePipes(ValidationPipe)
    signUp(
        @Headers('x-auth-use-password') usePassword: string,
        @Body(UserRolValidationPipe) authSignUpDto: AuthSignUpDto,
    ): Promise<Object> {
        return this.authService.signUp(authSignUpDto, usePassword === 'true');
    }

    @Roles()
    @UseGuards(RolesGuard)
    @Post('/signin')
    signIn(
        @Body() authCredentialsDto: AuthCredentialsDto,
    ): Promise<AuthToken> {
        return this.authService.signIn(authCredentialsDto);
    }

    @Post('/password-set')
    setPassword(
        @Body() setPasswordDto: SetPassowrdDto,
    ): Promise<Object> {
        return this.authService.setPassword(setPasswordDto);
    }

    @Patch('/password-update')
    @UseGuards(AuthGuard('jwt'))
    updatePassword(
        @Body() updatePasswordDto: UpdatePasswordDto,
        @GetUser() user: User,
    ): Promise<any> {
        return this.authService.updatePassword(updatePasswordDto, user);
    }
}
