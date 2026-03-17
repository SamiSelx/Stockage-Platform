

export default function Hero() {
  return (
    <section className="pt-32 pb-16 md:pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-pretty">
              Your files. Fully encrypted. Only you have the keys.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              CryptoDrive protects your documents with end-to-end encryption
              directly in your browser. Your files are encrypted before they
              reach our servers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Start Securing Files
              </button>
              <button
                className="border-border hover:bg-secondary"
              >
                Learn about Security
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl"></div>
              <div className="absolute inset-8 bg-gradient-to-tr from-accent/30 to-transparent rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block p-4 bg-background rounded-2xl shadow-lg mb-4">
                    <svg
                      className="w-24 h-24 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    End-to-End Encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
