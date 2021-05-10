import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as config from 'config';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { User } from '../user/user.entity';
import { JwtPayload } from './jwt-payload.interface';

const JWT_CONFIG = config.get('jwt') as any;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || JWT_CONFIG.secret,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { email } = payload;
        const user = await this.userRepository.findOne({ email }, { relations: ['rol', 'enterprise'] });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
