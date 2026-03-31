import { Star, Trash2 } from "lucide-react";
import { useGetStarredFilesQuery } from "@/app/backend/endpoints/file";
import {
  useSupprimerFichierMutation,
  useSetStarredFilesMutation,
} from "@/app/backend/endpoints/file";
import { toast } from "sonner";

export default function Starred() {
  const { data: starredFiles, isLoading, error } = useGetStarredFilesQuery();
  const [deleteFile] = useSupprimerFichierMutation(); //gonna store it in archive not delete it
  const [setStarred] = useSetStarredFilesMutation();

  const files = starredFiles?.data?.files || [];
  console.log("Starred files:", files);

  const handleDeletePermanently = async (id: string) => {
    try {
      await deleteFile(id).unwrap();
      toast.success("File moved to trash successfully!");
    } catch (err) {
      toast.error("Failed to move file to trash.");
      console.error("Delete error:", err);
    }
  };

  const handleToggleStar = async (file: FileI) => {
    try {
      await setStarred({
        fileId: file._id,
        starred: !file.isStarred,
      }).unwrap();

      console.log("Toggled star:", file._id);
    } catch (err) {
      console.error("Star error:", err);
      toast.error("Failed to update star status.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Starred Files</h1>
        <p className="text-gray-500 text-sm">
          Your favorite and important files
        </p>
      </div>

      {/* Loading */}
      {isLoading && <p className="text-gray-500 text-sm">Loading files...</p>}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">Failed to load starred files</p>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {files.map((file: FileI) => (
                <div
                  key={file._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 hover:shadow-lg transition-all duration-200 group"
                >
                  {/* Top Actions */}
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => handleToggleStar(file)}
                      title={file.isStarred ? "Unstar" : "Star"}
                    >
                      <Star
                        className={`cursor-pointer transition ${
                          file.isStarred
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                        size={20}
                      />
                    </button>

                    <button
                      onClick={() => handleDeletePermanently(file._id)}
                      className="opacity-0 group-hover:opacity-100 transition"
                      title="Delete"
                    >
                      <Trash2
                        className="text-gray-400 hover:text-red-500"
                        size={18}
                      />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h2 className="font-semibold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.type} • {file.size} MB
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 text-xs text-gray-400">
                    Last modified:{" "}
                    {new Date(file.updatedAt).toLocaleDateString()}
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
        </>
      )}
    </div>
  );
}
