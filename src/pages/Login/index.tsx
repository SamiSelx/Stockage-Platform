import {
  useEnrollCertificateMutation,
  useLoginMutation,
  useLogoutMutation,
  useStartIdentityChallengeMutation,
  useVerifyIdentityChallengeMutation,
} from "@/app/backend/endpoints/auth";
import { Button } from "@/components/ui/Button";
import useUser from "@/hooks/useUser";
import { LoginSchema } from "@/schemas/LoginSchema";
import { Form, FormikProvider, useFormik } from "formik";
import { Loader2, Lock } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import useTitle from "@/hooks/useTitle";
import {
  buildAuthChallengePayload,
  cacheRMKForSession,
  decryptPrivateKey,
  decryptRMK,
  decryptSigningPrivateKey,
  deriveKEK,
  exportPublicKeySpki,
  generateIdentitySigningKeyPair,
  generateSessionKey,
  getIdentityAuthMaterial,
  protectSigningPrivateKey,
  signAuthChallengePayload,
  storeIdentityAuthMaterial,
  storeRSAKeys,
} from "@/utils/crypto";
import { base64ToUint8Array } from "@/utils/convertBase64";
import uint8ToBase64, { stringToUint8Array } from "@/utils/convertBase64";

export default function Login() {
  useTitle("Stockage Platform - Connexion");
  const [login, { isLoading }] = useLoginMutation();
  const [enrollCertificate] = useEnrollCertificateMutation();
  const [startIdentityChallenge] = useStartIdentityChallengeMutation();
  const [verifyIdentityChallenge] = useVerifyIdentityChallengeMutation();
  const { user, setUser, removeUser } = useUser();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && Object.keys(user).length != 0) navigate("/dashboard");
  }, [user, navigate]);

  const formik = useFormik<LoginI>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (body) => {
      console.log("[LOGIN_DEBUG] Submit started", {
        email: body.email,
        certAuthEnabled: import.meta.env.VITE_ENABLE_CERT_AUTH === "true",
      });

      login(body)
        .unwrap()
        .then(async (res) => {
          console.log("[LOGIN_DEBUG] Login API success", {
            hasData: !!res.data,
            message: res.message,
          });

          if (!res.data) {
            throw new Error("Missing user payload in login response");
          }

          const userData = res.data;
          const certAuthEnabled =
            import.meta.env.VITE_ENABLE_CERT_AUTH === "true";
          let localIdentityMaterial = await getIdentityAuthMaterial();
          console.log("[LOGIN_DEBUG] Identity material presence", {
            userId: userData._id,
            email: userData.email,
            hasToken: !!userData.token,
            hasBackendIdentityCertificate: !!userData.identityCertificate,
            hasBackendIdentityCertSignature: !!userData.identityCertSignature,
            hasLocalIdentityCertificate: !!localIdentityMaterial?.certificate,
            hasLocalIdentityCertSignature:
              !!localIdentityMaterial?.caSignatureB64,
          });

          const salt = base64ToUint8Array(userData.salt);
          const encryptedRMK = base64ToUint8Array(userData.encryptedRMK);
          const iv = base64ToUint8Array(userData.rmk_iv);

          // derive KEK
          const kek = await deriveKEK(body.password, salt);

          // decrypt RMK
          const rmk = await decryptRMK(encryptedRMK, kek, iv);
          console.log("[LOGIN_DEBUG] RMK decrypted successfully");

          // generate session key
          generateSessionKey();

          // cache RMK for refresh
          await cacheRMKForSession(rmk);

          const encryptedPrivateKey = base64ToUint8Array(
            userData.encryptedPrivateKey,
          );
          const privateKey_iv = base64ToUint8Array(userData.privateKey_iv);
          const publicKey = base64ToUint8Array(userData.publicKey);

          // decrypt private key (for sharing features)
          const privateKey = await decryptPrivateKey(
            encryptedPrivateKey,
            privateKey_iv,
            kek,
          );

          await storeRSAKeys(publicKey, privateKey);
          console.log("[LOGIN_DEBUG] RSA keys stored in IndexedDB");

          if (certAuthEnabled) {
            console.log("[LOGIN_DEBUG] Certificate auth flow enabled");
            if (!localIdentityMaterial && userData.token) {
              try {
                console.log(
                  "[LOGIN_DEBUG] No local identity material found, attempting re-enrollment",
                );
                const signingKeyPair = await generateIdentitySigningKeyPair();
                const signPublicKeySpki = await exportPublicKeySpki(
                  signingKeyPair.publicKey,
                );
                const {
                  encryptedPrivateKey: encryptedSigningPrivateKey,
                  iv: signingPrivateKeyIv,
                } = await protectSigningPrivateKey(
                  signingKeyPair.privateKey,
                  kek,
                );

                const enrollRes = await enrollCertificate({
                  userId: userData._id,
                  email: userData.email,
                  signPublicKeySpkiB64: uint8ToBase64(signPublicKeySpki),
                  token: userData.token,
                }).unwrap();

                if (enrollRes.data) {
                  await storeIdentityAuthMaterial({
                    certificate: enrollRes.data.certificate,
                    caSignatureB64: enrollRes.data.caSignatureB64,
                    encryptedSigningPrivateKey,
                    signingPrivateKeyIv,
                  });

                  localIdentityMaterial = {
                    certificate: enrollRes.data.certificate,
                    caSignatureB64: enrollRes.data.caSignatureB64,
                    encryptedSigningPrivateKey,
                    signingPrivateKeyIv,
                  };

                  console.log(
                    "[LOGIN_DEBUG] Re-enrollment succeeded and local identity material restored",
                  );
                }
              } catch (enrollErr) {
                console.error(
                  "[LOGIN_DEBUG] Re-enrollment failed; continuing without local identity material",
                  enrollErr,
                );
              }
            }

            const identityMaterial = localIdentityMaterial;
            if (identityMaterial) {
              console.log("[LOGIN_DEBUG] Identity material found locally");
              console.log("[CERT_DEBUG] Local certificate fields", {
                certId: identityMaterial.certificate.certId,
                serialNumber: identityMaterial.certificate.serialNumber,
                issuer: identityMaterial.certificate.issuer,
                subjectUserId: identityMaterial.certificate.subject.userId,
                subjectEmail: identityMaterial.certificate.subject.email,
                sigAlg: identityMaterial.certificate.sigAlg,
                keyUsage: identityMaterial.certificate.keyUsage,
                notBefore: identityMaterial.certificate.notBefore,
                notAfter: identityMaterial.certificate.notAfter,
                hasCaSignature: !!identityMaterial.caSignatureB64,
              });

              const challengeRes = await startIdentityChallenge({
                email: userData.email,
                token: userData.token,
              }).unwrap();
              if (!challengeRes.data) {
                throw new Error("Missing challenge payload");
              }

              const challengeData = challengeRes.data;
              console.log("[CERT_DEBUG] Challenge fields", {
                challengeId: challengeData.challengeId,
                noncePreview: challengeData.nonceB64?.slice(0, 12),
                expiresAt: challengeData.expiresAt,
                serverTime: challengeData.serverTime,
                sigAlgRequired: challengeData.sigAlgRequired,
              });

              const signingPrivateKey = await decryptSigningPrivateKey(
                identityMaterial.encryptedSigningPrivateKey,
                identityMaterial.signingPrivateKeyIv,
                kek,
              );

              const clientTimestamp = new Date().toISOString();
              const payload = buildAuthChallengePayload({
                challengeId: challengeData.challengeId,
                nonceB64: challengeData.nonceB64,
                userId: userData._id,
                email: userData.email,
                clientTimestamp,
              });

              const signature = await signAuthChallengePayload(
                payload,
                signingPrivateKey,
              );
              console.log("[CERT_DEBUG] Signed payload metadata", {
                clientTimestamp,
                payloadLength: payload.length,
                signatureBytes: signature.byteLength,
              });

              await verifyIdentityChallenge({
                challengeId: challengeData.challengeId,
                certificate: identityMaterial.certificate,
                caSignatureB64: identityMaterial.caSignatureB64,
                clientTimestamp,
                signedPayloadB64: uint8ToBase64(stringToUint8Array(payload)),
                signatureB64: uint8ToBase64(signature),
                token: userData.token,
              }).unwrap();
              console.log(
                "[LOGIN_DEBUG] Identity challenge verified successfully",
              );
            } else {
              console.warn(
                "[LOGIN_DEBUG] Certificate auth enabled but no local identity material found",
              );
            }
          }

          const normalizedUserData =
            !userData.identityCertificate && localIdentityMaterial
              ? {
                  ...userData,
                  identityCertificate: localIdentityMaterial.certificate,
                  identityCertSignature: localIdentityMaterial.caSignatureB64,
                }
              : userData;
          setUser(normalizedUserData);

          toast.success("Connexion réussie", {
            // title: "Connexion réussie",
            description: res.message,
          });
        })
        .catch(async (err) => {
          console.error("[LOGIN_DEBUG] Login flow failed", err);
          removeUser();
          await logout();
          toast.error("Erreur de connexion", {
            // title: "Erreur de connexion",
            description: err.data?.error || "Une erreur est survenue",
          });
        });
    },
  });

  const { getFieldProps, errors, touched, handleSubmit } = formik;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <Link to="/" className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br  p-3 rounded-lg">
              {/* <Cloud className="text-white" size={28} /> */}
              <span className="text-primary-foreground font-bold text-lg">
                <img src={logo} alt="CryptoDrive Logo" className="w-10 h-10" />
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              CryptoDrive
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Système de stockage chiffré sécurisé
          </p>
        </Link>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-6">
          <FormikProvider value={formik}>
            <Form onSubmit={handleSubmit} className="space-y-4">
              {inputs.map((field, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {/* <label htmlFor={field.id}>{field.label}</label> */}
                  <label
                    htmlFor={field.id}
                    className="text-start block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    {field.label}
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    id={field.id}
                    type={field.type}
                    autoCapitalize={field.id === "email" ? "none" : "on"}
                    placeholder={field.placeholder}
                    {...getFieldProps(field.id)}
                  />
                  {touched[field.id as keyof typeof touched] &&
                    errors[field.id as keyof typeof errors] && (
                      <p className="text-red-500 mt-1 text-start">
                        {errors[field.id as keyof typeof errors]}
                      </p>
                    )}
                </div>
              ))}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="inline mr-2 animate-spin" size={18} />
                    Connection en cours
                  </>
                ) : (
                  <>
                    <Lock className="inline mr-2" size={18} />
                    Se connecter
                  </>
                )}
              </Button>
            </Form>
          </FormikProvider>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Pas de compte ? Inscrivez-vous
            </p>
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputs = [
  {
    id: "email",
    label: "Email",
    type: "text",
    placeholder: "Entrez votre email",
    required: true,
  },
  {
    id: "password",
    label: "Mot de passe",
    type: "password",
    placeholder: "••••••••",
    required: true,
  },
];
