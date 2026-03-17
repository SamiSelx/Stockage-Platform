import logoPdf from "@/assets/pdflogo.jpg";

export function RapportSection() {
  return (
    <div className="flex items-center justify-center  ">
      <div className="flex items-center gap-5 p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-300 max-w-3xl">
        {/* Left content */}
        <div className="flex flex-col items-center text-center max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Download Security Report
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Access the full encryption report containing technical details about
            how your files are secured with end-to-end encryption.
          </p>

          <button className="w-fit bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-5 rounded-lg transition-transform duration-300 hover:scale-105">
            Download PDF
          </button>
        </div>

        {/* Right preview */}
        <div className="flex items-center justify-center bg-gray-50 p-3 rounded-xl">
          <img
            src={logoPdf}
            alt="Rapport Image"
            className="w-28 h-28 object-cover rounded-lg shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
