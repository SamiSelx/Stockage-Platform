import useUser from "@/hooks/useUser";
import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

export default function ProtectRoute({
  children,
  // isAdmin = false,
  redirectPath = "/login",
}: {
  children: ReactNode;
  // isAdmin: boolean;
  redirectPath?: string;
}) {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && Object.keys(user).length == 0) {
      return;
    }
    if (!user) {
      navigate(redirectPath);
      return;
    } 
  }, [user, navigate]);

  if((user && Object.keys(user).length == 0) || !user) return (
    <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={48} />
    </div>
  )
  return <>{children}</>;
}