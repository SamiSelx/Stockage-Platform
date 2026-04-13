import {
  useSupprimerFichierDefinitivementMutation,
  useRestaurerFichierMutation,
  useGetTrashFilesQuery,
} from "@/app/backend/endpoints/file";

import {
  useGetTrashFoldersQuery,
  useRestaurerDossierMutation,
  useSupprimerDossierDefinitivementMutation,
} from "@/app/backend/endpoints/folder";
import { formatFileSize } from "@/utils/formatFileSize";

import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Trash() {
  const { data: trashedFiles, isLoading, error } = useGetTrashFilesQuery(); //les fichiers historiques
  const files = trashedFiles?.data?.files || [];

  const { data: trashFolders } = useGetTrashFoldersQuery();
  const folders = trashFolders?.data?.folders || [];

  console.log("Trashed files:", files);
  console.log("Trashed folders:", folders);

  //for files
  const [supprimerFichierDefinitivement, { isLoading: isDeleting }] =
    useSupprimerFichierDefinitivementMutation();

  const [restaurerFichier, { isLoading: isRestoring }] =
    useRestaurerFichierMutation();

  //for folders
  const [supprimerDossierDefinitivement, { isLoading: isDeletingFolder }] =
    useSupprimerDossierDefinitivementMutation();

  const [restaurerDossier, { isLoading: isRestoringFolder }] =
    useRestaurerDossierMutation();

  //  Restore Files
  const handleRestoreFiles = async (id: string) => {
    try {
      await restaurerFichier(id).unwrap();
      toast.success("File restored successfully!");
    } catch (err) {
      toast.error("Failed to restore file.");
      console.error("Restore error:", err);
    }
  };

  //  Delete permanently Files
  const handleDeleteDefinitivelyFiles = async (id: string) => {
    const isConfirmed = window.confirm(
      "This file will be deleted Definitively and cannot be recovered. Continue?",
    );
    if (!isConfirmed) return;

    try {
      await supprimerFichierDefinitivement(id).unwrap();
      toast.success("File deleted definitively!");
    } catch (err) {
      toast.error("Failed to delete file definitively.");
      console.error("Delete error:", err);
    }
  };

  // Restore Folders
  const handleRestoreFolders = async (id: string) => {
    try {
      await restaurerDossier(id).unwrap();
      toast.success("Folder restored successfully!");
    } catch (err) {
      toast.error("Failed to restore folder.");
      console.error("Restore error:", err);
    }
  };

  // Delete permanently Folders
  const handleDeleteDefinitivelyFolders = async (id: string) => {
    const isConfirmed = window.confirm(
      "This folder will be deleted Definitively and cannot be recovered. Continue?",
    );
    if (!isConfirmed) return;

    try {
      await supprimerDossierDefinitivement(id).unwrap();
      toast.success("Folder deleted definitively!");
    } catch (err) {
      toast.error("Failed to delete folder definitively.");
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
      </div>

      {/* Warning */}
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Warning: Deleting a file from Trash permanently will remove it forever.
      </div>

      {/* Loading */}
      {isLoading && <p className="text-gray-500 text-sm">Loading trash...</p>}

      {/* Error */}
      {error && <p className="text-red-500 text-sm">Failed to load trash</p>}

      {/* Content */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT → FOLDERS */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-semibold text-gray-700">Folders</h2>

            {folders.length > 0 ? (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white border rounded-lg p-4 flex justify-between items-center hover:shadow-sm"
                >
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(folder.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestoreFolders(folder.id)}
                      disabled={isRestoringFolder}
                      className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 disabled:opacity-50"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteDefinitivelyFolders(folder.id)
                      }
                      disabled={isDeletingFolder}
                      className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No folders in trash</p>
            )}
          </div>

          {/* RIGHT → FILES */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-700">Files</h2>

            {files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white border rounded-lg p-4 flex flex-col justify-between hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium truncate">{file.filename}</p>
                      <p className="text-xs text-gray-400">
                        {file.type} • {formatFileSize(file.size)}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {/* Restore */}
                      <button
                        onClick={() => handleRestoreFiles(file.id)}
                        disabled={isRestoring}
                        className="flex-1 flex items-center justify-center gap-1 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>

                      {/* Delete permanently */}
                      <button
                        onClick={() => handleDeleteDefinitivelyFiles(file.id)}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-1 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No files in trash</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
