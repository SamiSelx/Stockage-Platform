import { useRegisterMutation } from "@/app/backend/endpoints/auth";
import { Button } from "@/components/ui/Button";
import useUser from "@/hooks/useUser";
import { RegisterSchema } from "@/schemas/RegisterSchema";
import { Form, FormikProvider, useFormik } from "formik";
import { Loader2, User } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import useTitle from "@/hooks/useTitle";
import { deriveKEK, encryptRMK, generateRMK } from "@/utils/crypto";
import uint8ToBase64 from "@/utils/convertBase64";

export default function Register() {
  useTitle("Stockage Platform - Inscription");
  const [register, { isLoading }] = useRegisterMutation();
  const { user, setUser, removeUser } = useUser();
  const navigate = useNavigate();

  const initUser = async (password: string) => {
      console.log("=== INIT USER ===");
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const kek = await deriveKEK(password, salt);
      const rmk = await generateRMK();
      const { encryptedRMK, iv } = await encryptRMK(rmk, kek);
      return { salt, encryptedRMK, rmk_iv: iv }
    };

  useEffect(() => {
    if (user && Object.keys(user).length != 0) navigate("/dashboard");
  }, [user]);

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
      const { salt, encryptedRMK, rmk_iv } = await initUser(body.password)
      const userData = { ...body, salt: uint8ToBase64(salt), encryptedRMK: uint8ToBase64(encryptedRMK), rmk_iv: uint8ToBase64(rmk_iv) }
      console.log("=== USER INIT ===", userData);
      register({ ...body, salt: uint8ToBase64(salt), encryptedRMK: uint8ToBase64(encryptedRMK), rmk_iv: uint8ToBase64(rmk_iv) })
        .unwrap()
        .then((res) => {
          setUser(res.data)
          toast.success("Inscription réussie", {
            description: res.message
          });
        })
        .catch((err) => {
          removeUser()
          toast.error("Erreur d'inscription", {
            description: err.data?.error || "Une erreur est survenue"
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
    </div>
  );
}

// const inputs = [
//   {
//     id: "firstName",
//     label: "First Name",
//     type: "text",
//     placeholder: "Prénom",
//   },
//   {
//     id: "lastName",
//     label: "Last Name",
//     type: "text",
//     placeholder: "Nom",
//   },
//   {
//     id: "email",
//     label: "Email",
//     type: "text",
//     placeholder: "Email",
//   },
//   {
//     id: "password",
//     label: "Password",
//     type: "password",
//     placeholder: "Mot de passe",
//   },
//   {
//     id: "confirmPassword",
//     label: "Confirm Password",
//     type: "password",
//     placeholder: "Confirm Password",
//   },
// ];
