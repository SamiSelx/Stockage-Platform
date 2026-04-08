import api from "../index";

const API_USER = "user"

export const apiAuth = api.injectEndpoints({
    endpoints: (build) => ({
        getAllUsers: build.query<ResponseI<UserI[]>, void>({
            query: () => ({
                url: `${API_USER}`,
                method: "GET",
            }),
        }),
        getPublicKey: build.mutation<ResponseI<{ publicKey: string }>, { email: string }>({
            query: ({ email }) => ({
                url: `${API_USER}/${email}/public-key`,
                method: "GET",
            }),
        }),
    })
})

export const { useGetAllUsersQuery, useGetPublicKeyMutation } = apiAuth;