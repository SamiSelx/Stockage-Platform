import { Button } from "@/components/ui/Button";
import logo from "@/assets/img2.jpg";

export default function Hero() {
  return (
    <section className=" mt-7  md:pb-24 px-4">
      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center ">
            <h1 className="text-3xl md:text-5xl lg:text-4xl font-crypto font-bold mb-4 ">
              <span className="">Your files. Fully encrypted.</span>

              <span className="text-primary block mt-3">
                Only you have the keys.
              </span>
            </h1>

            <p className="text-lg font-code text-muted-foreground mb-8 leading-relaxed max-w-xl">
              CryptoDrive protects your documents with end-to-end encryption
              directly in your browser. Your files are encrypted before they
              reach our servers.
            </p>

            <div className="flex flex-col items-center justify-center sm:flex-row gap-4">
              <Button
                variant="outline"
                className="border-black text-black bg-white hover:bg-gray-100 font-code transition-all duration-300 hover:scale-105"
              >
                Start Securing Files
              </Button>
              <Button
                variant="outline"
                className="border-black text-black bg-white hover:bg-gray-100 font-code transition-all duration-300 hover:scale-105"
              >
                Learn about Security
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-8  from-accent/30 to-transparent rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block p-4  rounded-2xl w-[120%]  ">
                    <img src={logo} alt="Logo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
