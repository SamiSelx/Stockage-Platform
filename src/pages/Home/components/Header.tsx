import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";
import useUser from "@/hooks/useUser";
import { Link, useNavigate } from "react-router";
import { useLogoutMutation } from "@/app/backend/endpoints/auth";
import { toast } from "sonner";

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const { user,removeUser } = useUser()
  const navigate = useNavigate()
  const [logout] = useLogoutMutation()

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout(){
    logout()
      .unwrap()
      .then((data) => { 
        removeUser()
        // navigate("/login")
        toast.success("Déconnexion réussie", {
          description: data.message
        });
       })
      .catch((err) => { 
        toast.error("Erreur lors de la déconnexion", {
          description: err.data?.error || "Une erreur est survenue"
        });
        navigate("/login")
        removeUser()
       })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSticky
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link className="flex items-center gap-2" to="/">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              <img src={logo} alt="CryptoDrive Logo" className="w-10 h-8" />
            </span>
          </div>
          <span className="font-bold text-xl text-foreground">CryptoDrive</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-foreground hover:text-accent transition-colors text-sm font-medium"
          >
            Features
          </a>
          <a
            href="#"
            className="text-foreground hover:text-accent transition-colors text-sm font-medium"
          >
            Security
          </a>
          <a
            href="#"
            className="text-foreground hover:text-accent transition-colors text-sm font-medium"
          >
            Algorithms
          </a>
          <a
            href="#"
            className="text-foreground hover:text-accent transition-colors text-sm font-medium"
          >
            Rapport
          </a>
        </nav>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          {user && Object.keys(user).length != 0 ? (
            <>
              <Button  className="border-border hover:bg-secondary font-code transition-all duration-300 hover:scale-105" onClick={() => handleLogout()}>
              Se déconnecter
            </Button>
            <Button onClick={()=> navigate("/dashboard")} className="border-border hover:bg-secondary font-code transition-all duration-300 hover:scale-105">
              Dashboard
            </Button>
            </>
          ) : (
            <>
            <Button onClick={()=> navigate("/login")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Login
            </Button>
              <Button onClick={()=> navigate("/register")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
            </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
