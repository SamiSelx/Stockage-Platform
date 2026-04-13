import { Link, useNavigate } from "react-router";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useChangePasswordMutation, useGetCryptoMaterialMutation } from "@/app/backend/endpoints/auth";
import { base64ToUint8Array } from "@/utils/convertBase64";
import { changePassword as deriveCryptoMaterial } from "@/utils/crypto";
import uint8ToBase64 from "@/utils/convertBase64";

export default function ChangePW() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [getCryptoMaterial] = useGetCryptoMaterialMutation();
  const [submitChangePassword] = useChangePasswordMutation();


 const handleChangePw = async (e) => {
   e.preventDefault();
   setIsLoading(true);

   try {
     const formData = new FormData(e.target);
     const oldPassword = String(formData.get("oldPassword") ?? "");
     const newPassword = String(formData.get("newPassword") ?? "");
     const confirmPassword = String(formData.get("confirmPassword") ?? "");

     if (!oldPassword || !newPassword || !confirmPassword) {
       toast.error("Please fill in all fields");
       return;
     }

     if (newPassword !== confirmPassword) {
       toast.error("Passwords do not match");
       return;
     }

     const cryptoMaterialResponse = await getCryptoMaterial().unwrap();
     const userSalt = base64ToUint8Array(cryptoMaterialResponse.data?.salt);
     const encryptedRMK = base64ToUint8Array(cryptoMaterialResponse.data?.encryptedRMK);
     const rmk_iv = base64ToUint8Array(cryptoMaterialResponse.data?.rmk_iv);
 
     console.log("before:",encryptedRMK)
     const result = await deriveCryptoMaterial(
       oldPassword,
       newPassword,
       userSalt,
       encryptedRMK,
       rmk_iv,
     ); 
console.log("result",result);
     await submitChangePassword({
       oldPassword,
       newPassword,
       salt: uint8ToBase64(userSalt),
       encryptedRMK: uint8ToBase64(result.encryptedRMK),
       rmk_iv: uint8ToBase64(result.rmk_iv),
     }).unwrap();

     toast.success("Password changed successfully");
     navigate("/login");
   } catch (err) {
     console.error(err);
     toast.error("Error changing password ");
   } finally {
     setIsLoading(false);
   }
 };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <Link to="/" className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg">
              <img src={logo} alt="Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold">CryptoDrive</h1>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Old password</label>
              <input
                name="oldPassword"
                type="password"
                placeholder="Enter old password"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">New password</label>
              <input
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Type again password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Retype new password"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="inline mr-2 animate-spin" size={18} />
                  Loading...
                </>
              ) : (
                <>
                  <Lock className="inline mr-2" size={18} />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
