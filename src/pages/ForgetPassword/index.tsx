import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  deriveKEK,
  decryptRMKWithRecoveryKey,
  encryptRMK,
  decryptPrivateKeyWithRecoveryKey,
} from "@/utils/crypto";
import { base64ToUint8Array } from "@/utils/convertBase64";
import uint8ToBase64 from "@/utils/convertBase64";

const apiUrl = import.meta.env.VITE_API_URL;
const webCrypto: Crypto = globalThis.crypto;


export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    recoveryKey: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (form.newPassword !== form.confirmPassword) {
    toast.error("Les mots de passe ne correspondent pas");
    return;
  }

  setIsLoading(true);
  try {
    // 1. Fetch recovery-encrypted data from backend
    const res = await fetch(
      `${apiUrl}/auth/public-data?email=${encodeURIComponent(form.email)}`,
      { credentials: "include" }
    );
    const { data } = await res.json();
    if (!data) throw new Error("Utilisateur introuvable");

    const salt            = base64ToUint8Array(data.salt);
    const encRMK_recovery = base64ToUint8Array(data.encryptedRMK_recovery);
    const rmk_recovery_iv = base64ToUint8Array(data.rmk_recovery_iv);
    const encPK_recovery  = base64ToUint8Array(data.encryptedPrivateKey_recovery);
    const pk_recovery_iv  = base64ToUint8Array(data.privateKey_recovery_iv);

    const recoveryKey = form.recoveryKey.trim();

    // 2. Decrypt RMK + private key using recovery key (all client-side)
    const rmk        = await decryptRMKWithRecoveryKey(encRMK_recovery, rmk_recovery_iv, recoveryKey);
    const privateKey = await decryptPrivateKeyWithRecoveryKey(encPK_recovery, pk_recovery_iv, recoveryKey);

    // 3. Derive new KEK from new password + same salt
    const newKek = await deriveKEK(form.newPassword, salt);

    // 4. Re-encrypt RMK with new KEK
    const { encryptedRMK: newEncryptedRMK, iv: newRmk_iv } = await encryptRMK(rmk, newKek);

    // 5. Re-encrypt private key with new KEK (inline — no public key needed for re-encryption)
    const rawPrivateKey = await webCrypto.subtle.exportKey("pkcs8", privateKey);
    const pk_iv = webCrypto.getRandomValues(new Uint8Array(12));
    const newEncPrivateKeyBuffer = await webCrypto.subtle.encrypt(
      { name: "AES-GCM", iv: pk_iv, tagLength: 128 },
      newKek,
      rawPrivateKey
    );
    const newEncPrivateKey = new Uint8Array(newEncPrivateKeyBuffer);

    // 6. Send everything to backend
    await fetch(`${apiUrl}/auth/reset-password/recovery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        newPassword: form.newPassword,
        newEncryptedRMK: uint8ToBase64(newEncryptedRMK),
        newRmk_iv: uint8ToBase64(newRmk_iv),
        newEncryptedPrivateKey: uint8ToBase64(newEncPrivateKey),
        newPrivateKey_iv: uint8ToBase64(pk_iv),
      }),
    });

    toast.success("Mot de passe réinitialisé avec succès");
    navigate("/login");
  } catch {
    toast.error("Clé de récupération invalide ou email introuvable");
  } finally {
    setIsLoading(false);
  }
};

  const fields = [
    { id: "email", label: "Email", type: "text", placeholder: "votre@email.com" },
    { id: "recoveryKey", label: "Clé de récupération", type: "text", placeholder: "XXXX-XXXX-XXXX-..." },
    { id: "newPassword", label: "Nouveau mot de passe", type: "password", placeholder: "••••••••" },
    { id: "confirmPassword", label: "Confirmer le mot de passe", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">CryptoDrive</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Réinitialiser votre mot de passe
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(field => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.id as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-sm"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}