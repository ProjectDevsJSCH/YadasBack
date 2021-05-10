import { ENTERPRISE } from 'src/constants/enterprise.enum';
import { ROLES } from 'src/constants/roles.enum';

export interface JwtPayload {
    email: string;
    rol: ROLES;
    enterprise: ENTERPRISE;
    rolId: number;
    enterpriseId: number;
}
