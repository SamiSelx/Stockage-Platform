import { Trash2, RotateCcw } from "lucide-react";
import { mockFileSystem } from "@/constants/mock-data";

export default function Trash() {
  
  const files = mockFileSystem.files;

  const handleRestore = (id: string) => {
  console.log("Restore file:", id);
  };

  const handleDeletePermanently = (id: string) => {
  console.log("Delete permanently:", id);
  };

  return (
  <div className="p-6 space-y-6  min-h-screen">
    {/*  Header */}
    <div>
    <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
    <p className="text-gray-500 text-sm mt-1">
      Files will be permanently deleted after 30 days
    </p>
    </div>

    {/*  Grid */}
    {files.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {files.map((file) => (
      <div
        key={file._id}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden flex flex-col"
      >
        {/*  Icon */}
        <div className="bg-red-50 p-4 flex items-center justify-center">
        <Trash2 className="text-red-400" size={32} />
        </div>

        {/*  File Info */}
        <div className="p-4 flex-1">
        <h2 className="font-semibold truncate text-gray-900">{file.name}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {file.type} • {file.size}
        </p>
        </div>

        {/*  Action Buttons */}
        <div className="flex gap-2 p-4 border-t border-gray-100">
        {/* Restore */}
        <button 
          onClick={() => handleRestore(file._id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition text-sm font-medium"
        >
          <RotateCcw size={16} />
          Restore
        </button>

        {/* Delete permanently */}
        <button 
          onClick={() => handleDeletePermanently(file._id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition text-sm font-medium"
        >
          <Trash2 size={16} />
          Delete
        </button>
        </div>
      </div>
      ))}
    </div>
    ) : (
    <div className="text-center py-16 text-gray-400">
      <Trash2 size={48} className="mx-auto mb-3 opacity-50" />
      <p>Trash is empty</p>
    </div>
    )}
  </div>
  );
}
