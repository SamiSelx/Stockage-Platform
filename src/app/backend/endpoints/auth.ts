import api from "../index";

const API_AUTH = "auth"

export interface CertificateSubjectI {
    userId: string;
    email: string;
}

export interface MiniCertificateI {
    certId: string;
    serialNumber: string;
    subject: CertificateSubjectI;
    issuer: string;
    signPublicKeySpkiB64: string;
    keyUsage: string[];
    sigAlg: string;
    notBefore: string;
    notAfter: string;
}

export interface EnrollCertificateRequestI {
    userId: string;
    email: string;
    signPublicKeySpkiB64: string;
    proofOfAccount?: string;
    token?: string;
}

export interface EnrollCertificateResponseI {
    certificate: MiniCertificateI;
    caSignatureB64: string;
    caCertFingerprint?: string;
}

export interface StartIdentityChallengeRequestI {
    email: string;
    token?: string;
}

export interface StartIdentityChallengeResponseI {
    challengeId: string;
    nonceB64: string;
    expiresAt: string;
    serverTime: string;
    sigAlgRequired?: string;
}

export interface VerifyIdentityChallengeRequestI {
    challengeId: string;
    certificate: MiniCertificateI;
    caSignatureB64: string;
    clientTimestamp: string;
    signedPayloadB64: string;
    signatureB64: string;
    token?: string;
}

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
        register: build.mutation<ResponseI<UserI>, RegisterI & { salt: string; encryptedRMK: string; rmk_iv: string; encryptedRMK_recovery: string; rmk_recovery_iv: string; encryptedPrivateKey_recovery: string; privateKey_recovery_iv: string; publicKey: string; encryptedPrivateKey: string; privateKey_iv: string }>({
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
        getCryptoMaterial: build.mutation<ResponseI<Pick<UserI, "salt" | "encryptedRMK" | "rmk_iv">>, void>({
            query: () => ({
                url: `${API_AUTH}/crypto-material`,
                method: "GET",
            }),
            invalidatesTags: ["auth"]
        }),
        changePassword: build.mutation<ResponseI<UserI>, {
            oldPassword: string;
            newPassword: string;
            salt: string;
            encryptedRMK: string;
            rmk_iv: string;
        }>({
            query: (body) => ({
                url: `${API_AUTH}/change-password`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["auth"]
        }),
        logout: build.mutation<ResponseI<null>, void>({
            query: () => ({
                url: `${API_AUTH}/logout`,
                method: "GET",
            }),
            invalidatesTags: ["auth"]
        }),
        enrollCertificate: build.mutation<ResponseI<EnrollCertificateResponseI>, EnrollCertificateRequestI>({
            query: ({ token, ...body }) => ({
                url: `${API_AUTH}/cert/enroll`,
                method: "POST",
                body,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }),
            invalidatesTags: ["auth"]
        }),
        startIdentityChallenge: build.mutation<ResponseI<StartIdentityChallengeResponseI>, StartIdentityChallengeRequestI>({
            query: ({ token, ...body }) => ({
                url: `${API_AUTH}/challenge/start`,
                method: "POST",
                body,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }),
            invalidatesTags: ["auth"]
        }),
        verifyIdentityChallenge: build.mutation<ResponseI<UserI>, VerifyIdentityChallengeRequestI>({
            query: ({ token, ...body }) => ({
                url: `${API_AUTH}/challenge/verify`,
                method: "POST",
                body,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }),
            invalidatesTags: ["auth"]
        })
    })
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserMutation,
  useGetCryptoMaterialMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useEnrollCertificateMutation,
  useStartIdentityChallengeMutation,
  useVerifyIdentityChallengeMutation,
} = apiAuth;