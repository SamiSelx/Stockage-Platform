import api from "../index";

const API_AUTH = "auth"

export const apiAuth = api.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation<ResponseI<UserI>, LoginI>({
            query: (body) => ({
                url: `${API_AUTH}/login`,
                method: "POST",
                body
            }),
            invalidatesTags: ["auth"]
        }),
        register: build.mutation<ResponseI<UserI>, RegisterI & { salt: string; encryptedRMK: string; rmk_iv: string; publicKey: string; encryptedPrivateKey: string; privateKey_iv: string }>({
            query: (body) => ({
                url: `${API_AUTH}/register`,
                method: "POST",
                body
            }),
            invalidatesTags: ["auth"]
        }),
        getUser: build.mutation<ResponseI<UserI>, void>({
            query: () => ({
                url: `${API_AUTH}/`,
                method: "GET",
            }),
            invalidatesTags: ["auth"]
        }),
        logout: build.mutation<ResponseI<null>, void>({
            query: () => ({
                url: `${API_AUTH}/logout`,
                method: "GET",
            }),
            invalidatesTags: ["auth"]
        })
    })
})

export const { useLoginMutation, useRegisterMutation, useGetUserMutation, useLogoutMutation } = apiAuth;