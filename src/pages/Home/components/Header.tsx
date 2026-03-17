import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
                    <img src={logo} alt="CryptoDrive Logo" className="w-10 h-8" />
            </span>
          </div>
          <span className="font-bold text-xl text-foreground">CryptoDrive</span>
        </div>

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
            Pricing
          </a>
          <a
            href="#"
            className="text-foreground hover:text-accent transition-colors text-sm font-medium"
          >
            Docs
          </a>
        </nav>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          <Button  className="border-border hover:bg-secondary ">
            Login
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
