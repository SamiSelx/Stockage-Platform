
import * as Yup from "yup";

export const RegisterSchema = Yup.object({
    firstName: Yup.string().min(3, "Le prénom doit contenir au moins 3 caractères").required("Prénom requis"),
    lastName: Yup.string().min(3, "Le nom doit contenir au moins 3 caractères").required("Nom requis"),
    email: Yup.string().email("Email invalide").required("Email requis"),
    password: Yup.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").required("Mot de passe requis"),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Les mots de passe doivent correspondre').required("Confirmation du mot de passe requise")
})