import {
    BadGatewayException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'src/reponse/response';
import { MESSAGES } from 'src/reponse/enums/messages-response.enum';
import { UserRepository } from '../user/user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthToken } from './auth-token.interface';
import { JwtPayload } from './jwt-payload.interface';
import { AuthRepository } from './auth.repository';
import { AuthSignUpDto } from './dto/auth-signup.dto';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { User } from '../user/user.entity';
import { SetPassowrdDto } from './dto/set-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthRepository)
        private authRepository: AuthRepository,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
        private enterpriseRepository: EnterpriseRepository,
        private readonly mailerService: MailerService,
        private logger: LoggerService,
    ) {
        this.logger.setContext('AuthService');
    }

    async signUp(authSignUpDto: AuthSignUpDto, usePassword): Promise<Object> {
        const {
            email,
            enterprise,
            name,
        } = authSignUpDto;
        const nameEnterprise = (await this.enterpriseRepository
            .find({ where: { id: enterprise }, take: 1 }))[0].enterprise;

        const resetToken = this.jwtService.sign(
            { email },
            { secret: process.env.SECRET },
        );
        const response = new Response(MESSAGES.CANT_SENT_MAIL);

        try {
            await this.userRepository.signUp(authSignUpDto, resetToken, usePassword);
        } catch (error) {
            await this.userRepository.delete({ email });
            throw new BadGatewayException(response.setError(error.toString()));
        }

        if (!usePassword) {
            try {
                await this.updatePasswordMailer(email,
                    name,
                    nameEnterprise,
                    resetToken);
            } catch (error) {
                await this.userRepository.delete({ email });
                throw new BadGatewayException(response.setError(error.toString()));
            }
        }

        return ({
            message: 'User successfully created.',
            resetToken,
        });
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<AuthToken> {
        const user = await this.authRepository.validateUserPassword(authCredentialsDto);
        const invalidCredentialsResponse = new Response(MESSAGES.INVALID_CREDENTIALS);

        if (!user) {
            throw new UnauthorizedException(invalidCredentialsResponse);
        }

        const payload: JwtPayload = {
            email: user.email,
            rol: user.rol.role,
            enterprise: user.enterprise.enterprise,
            rolId: user.rol.id,
            enterpriseId: user.enterprise.id,
        };

        const accessToken = await this.jwtService.sign(payload, { expiresIn: '1d' });

        return { accessToken };
    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto, user: User) {
        const invalidCredentialsResponse = new Response(MESSAGES.INVALID_CREDENTIALS);
        const { oldPassword, newPassword } = updatePasswordDto;

        if (!(await user.validatePassword(oldPassword))) {
            throw new UnauthorizedException(invalidCredentialsResponse);
        }

        this.userRepository.updatePassword(user.email, newPassword);
    }

    async setPassword(setPassowrdDto: SetPassowrdDto) {
        const { resetToken, password } = setPassowrdDto;
        const user: User = (await this.userRepository.find({ resetToken }))[0];

        if (!user) {
            throw new NotFoundException(new Response(
                MESSAGES.NOT_FOUND_MESSAGE,
                'User whit token not found',
            ));
        }

        await this.userRepository.updatePassword(user.email, password);

        return new Response(MESSAGES.PASSWORD_UPDATED);
    }

    private async updatePasswordMailer(
        email: string,
        name: string,
        enterprise: string,
        resetToken: string,
    ) {
        const setPasswordURL = `${process.env.URL_FRONT}/password-set?key=${resetToken}`;

        return this
            .mailerService
            .sendMail({
                to: email,
                from: process.env.USER_EMAIL,
                subject: 'Creacion de Usuario',
                template: 'user_creation',
                context: {
                    enterprise,
                    setPasswordURL,
                    name,
                },
            }).then((e) => {
                this.logger.debug('Email sent');
            });
    }
}
