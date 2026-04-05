import { useLoginMutation, useLogoutMutation } from "@/app/backend/endpoints/auth";
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
import { cacheRMKForSession, decryptPrivateKey, decryptRMK, deriveKEK, generateSessionKey, storeRSAKeys } from "@/utils/crypto";
import { base64ToUint8Array } from "@/utils/convertBase64";

export default function Login() {
  useTitle("Stockage Platform - Connexion");
  const [login, { isLoading }] = useLoginMutation();
  const { user, setUser, removeUser } = useUser();
  const [logout] = useLogoutMutation()
  const navigate = useNavigate();

  useEffect(() => {
    if (user && Object.keys(user).length != 0) navigate("/dashboard");
  }, [user]);

  const formik = useFormik<LoginI>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (body) => {
      login(body)
        .unwrap()
        .then(async (res) => {
          setUser(res.data);
          const salt = base64ToUint8Array(res.data?.salt as string);
          const encryptedRMK = base64ToUint8Array(res.data?.encryptedRMK as string);
          const iv = base64ToUint8Array(res.data?.rmk_iv as string);

          // derive KEK
          const kek = await deriveKEK(body.password, salt);

          // decrypt RMK
          const rmk = await decryptRMK(encryptedRMK, kek, iv);

          
          // generate session key
          generateSessionKey();

          // cache RMK for refresh
          await cacheRMKForSession(rmk);

          const encryptedPrivateKey = base64ToUint8Array(
            res.data?.encryptedPrivateKey as string
          );
          const privateKey_iv = base64ToUint8Array(
            res.data?.privateKey_iv as string
          );
          const publicKey = base64ToUint8Array(res.data?.publicKey as string);

          // decrypt private key (for sharing features)
          const privateKey = await decryptPrivateKey(
            encryptedPrivateKey,
            privateKey_iv,
            kek
          );
          
          await storeRSAKeys(publicKey, privateKey);

          toast.success("Connexion réussie",{
            // title: "Connexion réussie",
            description: res.message,
          });
        })
        .catch(async (err) => {
          console.log(err)
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
