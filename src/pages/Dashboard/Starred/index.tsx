import { Star, Trash2 } from "lucide-react";
import { mockFileSystem } from "@/constants/mock-data";

export default function Starred() {
  const files = mockFileSystem.files;

  return (
    <div className="p-6 space-y-6">
      {/*  Header */}
      <div>
        <h1 className="text-2xl font-bold">Starred Files</h1>
        <p className="text-gray-500 text-sm">
          Your favorite and important files
        </p>
      </div>

      {/*  Cards Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => (
            <div
              key={file._id}
              className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-all duration-200 group"
            >
              {/*  Star + Actions */}
              <div className="flex justify-between items-center mb-4">
                <Star className="text-yellow-400 fill-yellow-400" size={20} />

                <button className="opacity-0 group-hover:opacity-100 transition">
                  <Trash2
                    className="text-gray-400 hover:text-red-500"
                    size={18}
                  />
                </button>
              </div>

              {/*  File Info */}
              <div className="space-y-2">
                <h2 className="font-semibold truncate">{file.name}</h2>
                <p className="text-xs text-gray-500">
                  {file.type} • {file.size}
                </p>
              </div>

              {/*  Footer */}
              <div className="mt-4 text-xs text-gray-400">
                Last modified: {file.updatedAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <Star
              className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              size={48}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No starred files yet
          </h3>
          <p className="text-gray-400 text-sm">
            Star your important files to access them quickly
          </p>
        </div>
      )}
    </div>
  );
}
