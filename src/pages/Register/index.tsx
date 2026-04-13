import {
  useEnrollCertificateMutation,
  useRegisterMutation,
} from "@/app/backend/endpoints/auth";
import { Button } from "@/components/ui/Button";
import useUser from "@/hooks/useUser";
import { RegisterSchema } from "@/schemas/RegisterSchema";
import { Form, FormikProvider, useFormik } from "formik";
import { Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import useTitle from "@/hooks/useTitle";
import {
  deriveKEK,
  exportPublicKeySpki,
  encryptRMK,
  generateIdentitySigningKeyPair,
  generateRMK,
  generateRSAKeyPair,
  protectSigningPrivateKey,
  protectPrivateKey,
  storeIdentityAuthMaterial,
  generateRecoveryKey,
  encryptRMKWithRecoveryKey,
  protectPrivateKeyWithRecoveryKey,
} from "@/utils/crypto";
import uint8ToBase64 from "@/utils/convertBase64";

export default function Register() {
  useTitle("Stockage Platform - Inscription");
  const [register, { isLoading }] = useRegisterMutation();
  const [enrollCertificate] = useEnrollCertificateMutation();
  const { user, setUser, removeUser } = useUser();
  const navigate = useNavigate();
  const [recoveryKey, setRecoveryKey] = useState("");
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  const initUser = async (password: string) => {
    console.log("=== INIT USER ===");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const kek = await deriveKEK(password, salt);
    const rmk = await generateRMK();
    const { encryptedRMK, iv: rmk_iv } = await encryptRMK(rmk, kek);

    // Recovery key
  const recoveryKey = generateRecoveryKey();
  const { encryptedRMK_recovery, rmk_recovery_iv } = await encryptRMKWithRecoveryKey(rmk, recoveryKey);


    // generate RSA keypair (for sharing)
    const { publicKey, privateKey } = await generateRSAKeyPair();

    const {
      publicKey: exportedPublicKey,
      encryptedPrivateKey,
      privateKey_iv,
    } = await protectPrivateKey(privateKey, publicKey, kek);

    const { encryptedPrivateKey: encryptedPrivateKey_recovery, privateKey_iv: privateKey_recovery_iv } =
    await protectPrivateKeyWithRecoveryKey(privateKey, recoveryKey);

    return {
      salt,
      encryptedRMK,
      rmk_iv,
      recoveryKey,             // shown once to user
      encryptedRMK_recovery,
      rmk_recovery_iv,
      encryptedPrivateKey_recovery,        
    privateKey_recovery_iv,  
      publicKey: new Uint8Array(exportedPublicKey),

      encryptedPrivateKey: new Uint8Array(encryptedPrivateKey),
      privateKey_iv: privateKey_iv,
    };
  };

  useEffect(() => {
    if (user && Object.keys(user).length != 0 && showRecoveryDialog == false) navigate("/dashboard");
  }, [user, navigate, showRecoveryDialog]);

  const formik = useFormik<RegisterI & { confirmPassword: string }>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: RegisterSchema,
    onSubmit: async (body) => {
      const certAuthEnabled = import.meta.env.VITE_ENABLE_CERT_AUTH === "true";
      const {
        salt,
        encryptedRMK,
        rmk_iv,
        recoveryKey: generatedKey,
        encryptedRMK_recovery,
        rmk_recovery_iv,
        encryptedPrivateKey_recovery,
        privateKey_recovery_iv,
        publicKey,
        encryptedPrivateKey,
        privateKey_iv,
      } = await initUser(body.password);
      register({
        ...body,
        salt: uint8ToBase64(salt),
        encryptedRMK: uint8ToBase64(encryptedRMK),
        rmk_iv: uint8ToBase64(rmk_iv),
        encryptedRMK_recovery: uint8ToBase64(encryptedRMK_recovery),
        rmk_recovery_iv: uint8ToBase64(rmk_recovery_iv),    
        encryptedPrivateKey_recovery: uint8ToBase64(encryptedPrivateKey_recovery),
        privateKey_recovery_iv: uint8ToBase64(privateKey_recovery_iv),          
        publicKey: uint8ToBase64(publicKey),
        encryptedPrivateKey: uint8ToBase64(encryptedPrivateKey),
        privateKey_iv: uint8ToBase64(privateKey_iv),
      })
        .unwrap()
        .then(async (res) => {
          
          if (!res.data) {
            throw new Error("Missing user payload in register response");
          }
          setRecoveryKey(generatedKey);
          setShowRecoveryDialog(true);

          const userData = res.data;
          setUser(userData);
          console.log("[REGISTER_DEBUG] Register success", {
            userId: userData._id,
            email: userData.email,
            hasToken: !!userData.token,
            certAuthEnabled,
          });

          if (certAuthEnabled) {
            try {
              const signingKeyPair = await generateIdentitySigningKeyPair();
              const signPublicKeySpki = await exportPublicKeySpki(
                signingKeyPair.publicKey,
              );
              const kek = await deriveKEK(body.password, salt);
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

              if (!enrollRes.data) {
                throw new Error("Missing enrollment payload");
              }

              const enrollData = enrollRes.data;

              console.log("[REGISTER_DEBUG] Certificate enrollment success", {
                certId: enrollData.certificate?.certId,
                issuer: enrollData.certificate?.issuer,
                subjectEmail: enrollData.certificate?.subject?.email,
                hasCaSignature: !!enrollData.caSignatureB64,
              });

              await storeIdentityAuthMaterial({
                certificate: enrollData.certificate,
                caSignatureB64: enrollData.caSignatureB64,
                encryptedSigningPrivateKey,
                signingPrivateKeyIv,
              });
            } catch (certErr) {
              const errorObj = certErr as {
                status?: number;
                data?: unknown;
                message?: string;
              };
              console.error("[REGISTER_DEBUG] Certificate enrollment failed", {
                status: errorObj.status,
                data: errorObj.data,
                message: errorObj.message,
                error: certErr,
              });
              toast.error("Inscription partielle", {
                description:
                  "Compte cree, mais certificat d'identite indisponible. Reessayez plus tard.",
              });
            }
          }
          
          toast.success("Inscription réussie", {
            description: res.message,
          });
        })
        .catch((err) => {
          removeUser();
          toast.error("Erreur d'inscription", {
            description: err.data?.error || "Une erreur est survenue",
          });
        });
    },
  });

  const { handleSubmit, getFieldProps, touched, errors } = formik;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <Link to="/" className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br p-3 rounded-lg">
              <span className="text-primary-foreground font-bold text-lg">
                <img src={logo} alt="CryptoDrive Logo" className="w-10 h-10" />
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              CryptoDrive
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Créer un nouveau compte sécurisé
          </p>
        </Link>

        {/* Register Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-6">
          <FormikProvider value={formik}>
            <Form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-start block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    placeholder="Dupont"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    {...getFieldProps("lastName")}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-start text-red-500 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-start block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    placeholder="Jean"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    required
                    {...getFieldProps("firstName")}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-start text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-start block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="text"
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                  {...getFieldProps("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-start text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-start block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                  {...getFieldProps("password")}
                />
                {touched.password && errors.password && (
                  <p className="text-start text-red-500 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="text-start block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                  {...getFieldProps("confirmPassword")}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-start text-red-500 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                disabled={isLoading}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="inline mr-2 animate-spin" size={18} />
                    Création en cours
                  </>
                ) : (
                  <>
                    <User className="inline mr-2" size={18} />
                    S'inscrire
                  </>
                )}
              </Button>
            </Form>
          </FormikProvider>

          {/* Toggle to Login */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Vous avez déjà un compte ?
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
      {showRecoveryDialog && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 max-w-md w-full">
      <h2 className="text-xl font-bold mb-2">Clé de récupération</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Sauvegardez cette clé en lieu sûr. Elle vous permettra de réinitialiser
        votre mot de passe. <strong>Elle ne sera plus affichée.</strong>
      </p>
      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 font-mono text-center text-sm tracking-widest select-all mb-4 break-all">
        {recoveryKey}
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(recoveryKey)}
        className="w-full mb-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
      >
        📋 Copier
      </button>
      <button
        onClick={() => {
          setShowRecoveryDialog(false);
          navigate("/dashboard");
        }}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
      >
        J'ai sauvegardé ma clé →
      </button>
    </div>
  </div>
)}
    </div>
  );
}
