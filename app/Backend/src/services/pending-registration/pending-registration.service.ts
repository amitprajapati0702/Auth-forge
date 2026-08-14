import {redis}  from "../../infrastructure/redis/index.js"

import type { PendingRegistration } from "../../modules/auth/auth.types.js"

const PREFIX = "pending:user";


class PendingRegistrationService{
    private getkey(email:string):string{
        return `${PREFIX}:${email}`;
    }

    async store(data: PendingRegistration): Promise<void> {
        await redis.set(this.getkey(data.email), JSON.stringify(data), {
            EX: 600,
        });
    }

    async find(email:string):Promise<PendingRegistration|null>{
         const raw = await redis.get(this.getkey(email));
         
         if(!raw){
            return null;
         }
         return JSON.parse(raw);
        
    }

    async delete(email:string):Promise<void>{
        await redis.del(this.getkey(email));

    }

}

export const pendingRegistrationService = new PendingRegistrationService();

export default pendingRegistrationService;