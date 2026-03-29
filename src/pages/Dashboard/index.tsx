import { useState } from "react";
import { Lock, File } from "lucide-react";
import { UploadZone } from "@/components/MyDrive/utility-components";
import StorageQuotaCard from "@/components/Dashboard/StorageQuotaCard";
import { mockFileSystem } from "@/constants/mock-data";
import FileTable from "@/components/Dashboard/FilesTable";

export default function Overview() {
  const filesData = mockFileSystem.files;
  const [files, setFiles] = useState<FileI[]>(filesData);

  // Static quota data
  const totalQuota = 100; // MB
  const usedQuota = 13.2; // MB
  const remainingQuota = totalQuota - usedQuota;

  const handleDeleteFile = (_id: string) => {
    setFiles(files.filter((f) => f._id !== _id));
  };

  const handleUploadFile = () => {
    // Logic to handle file upload
  };

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Storage Quota Card */}
          <StorageQuotaCard
            used={usedQuota}
            total={totalQuota}
            remaining={remainingQuota}
          />

          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Statistiques
              </h3>
              <File className="text-blue-600" size={24} />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nombre de fichiers
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {files.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Espace utilisé
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {usedQuota.toFixed(1)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sécurité
              </h3>
              <Lock className="text-green-600" size={24} />
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Chiffrement AES activé
              </p>
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Tous les fichiers chiffrés
              </p>
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Accès sécurisé
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <UploadZone onUpload={handleUploadFile} />
        </div>

        {/* Files Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Vos fichiers
          </h2>
          {files.length > 0 ? (
            <FileTable files={files} onDelete={handleDeleteFile} />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No files found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
