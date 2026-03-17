import logo from '@/assets/logo.png';
export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                        <img src={logo} alt="CryptoDrive Logo" className="w-6 h-6" />
                </span>
              </div>
              <span className="font-bold text-lg">CryptoDrive</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Secure cloud storage built for privacy.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-sm">Product</h4>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Security
            </a>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Features
            </a>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Pricing
            </a>
          </div>

          {/* Links Column 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-sm">Legal</h4>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Documentation
            </a>
          </div>

          {/* Links Column 3 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-sm">Community</h4>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
            >
              Discord
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2026 CryptoDrive — Secure cloud storage built for privacy.
          </p>
          <div className="flex gap-6 text-primary-foreground/60">
            <a
              href="#"
              className="text-sm hover:text-primary-foreground transition-colors"
            >
              Status
            </a>
            <a
              href="#"
              className="text-sm hover:text-primary-foreground transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-sm hover:text-primary-foreground transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
