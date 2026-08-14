import {redis} from "../../infrastructure/redis/index.js"

class LockService{
    async acquire( key:string,ttlSeconds=10) :Promise<boolean> {
        const result = await redis.set(
            key,"1",{
                NX:true,
                EX:ttlSeconds
            }
        )

        return result === "OK"
    }

    async release(key:string):Promise<void>{
        await redis.del(key)

    }


}

export const lockService = new LockService()
export default lockService

