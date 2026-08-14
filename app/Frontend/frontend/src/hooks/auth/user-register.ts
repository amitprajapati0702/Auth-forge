"use client"

import { useMutation } from "@tanstack/react-query"

import { registeruser } from "@/lib/api/auth-api"

export function useRegister(){

    return useMutation({
        mutationFn : registeruser
    })
}