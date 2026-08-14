"use client"
import { useMutation,useQueryClient } from "@tanstack/react-query"
import { logoutuser } from "@/lib/api/auth-api"



export function userlogout(){
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queryclient = useQueryClient()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation({
        mutationFn:logoutuser,
        onSuccess(){
            queryclient.clear()
        }
    })
}

export const logout = userlogout()
