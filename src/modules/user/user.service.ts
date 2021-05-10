import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pick } from 'lodash';
import { userInfo } from 'os';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        public userRepository: UserRepository,
    ) { }

    async getUserList() {
        const userList = await this.userRepository
            .find();

        return userList.map((user) => user);
    }
}
