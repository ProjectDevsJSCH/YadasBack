import { Repository, EntityRepository } from 'typeorm';
import { User } from '../user/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@EntityRepository(User)
export class AuthRepository extends Repository<User> {
    constructor() {
        super();
    }

    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { email, password } = authCredentialsDto;
        const user = await this.findOne({ email }, { relations: ['rol', 'enterprise'] });

        if (user && await user.validatePassword(password)) {
            return user;
        }

        return null;
    }
}
