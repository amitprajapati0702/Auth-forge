import bcrypt from 'bcrypt';
import { AUTH_CONSTANTS } from '../../modules/auth/auth.constants.js';


class PasswordService{
    async hash(password:string):Promise<string>{
        return bcrypt.hash(password,AUTH_CONSTANTS.PASSWORD.BCRYPT_ROUNDS);
    }

    async compare(password:string , passwordHash:string):Promise<boolean>{
        return bcrypt.compare(password,passwordHash)

    }
}

export const  passwordService = new PasswordService()

export default passwordService;