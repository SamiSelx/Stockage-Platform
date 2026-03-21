import * as Yup from "yup";


export const LoginSchema = Yup.object({
    email: Yup.string().email("Email invalide").required("Email requis"),
    password: Yup.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").required("Mot de passe requis")
})