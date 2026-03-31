import { useEffect, useState } from "react";
import { Lock, File } from "lucide-react";
import { UploadZone } from "@/components/MyDrive/utility-components";
import StorageQuotaCard from "@/components/Dashboard/StorageQuotaCard";
import FileTable from "@/components/Dashboard/FilesTable";
import { useGetFilesQuery, useGetStatisticsQuery, useSupprimerFichierMutation } from "@/app/backend/endpoints/file";
import useUser from "@/hooks/useUser";
import { toast } from "sonner";

export default function Overview() {
  const { user } = useUser();
  const { data: statisticsData } = useGetStatisticsQuery();
  const statistics = statisticsData?.data;
  console.log("Fetched statistics for dashboard:", statistics);
  const { data: filesData } = useGetFilesQuery();
  const AllFiles = filesData?.data?.files || [];
  console.log("Fetched files for dashboard:", AllFiles);
  const [supprimerFichier] = useSupprimerFichierMutation();

  const [files, setFiles] = useState<FileI[]>(AllFiles);

  useEffect(() => {
    setFiles(AllFiles);
  }, [filesData]);

  const currentUser = user as Partial<UserI> | null;
  const bytesToMB = (value: number) => value / (1024 * 1024);
  const usedQuotaBytes = Number(
    statistics?.storage?.used ?? currentUser?.storageUsed ?? 0,
  );
  const totalQuotaBytes = Number(
    statistics?.storage?.total ?? currentUser?.storageLimit ?? 1024 * 1024 * 1024,
  );
  const usedQuota = bytesToMB(usedQuotaBytes);
  const totalQuota = bytesToMB(totalQuotaBytes);
  const remainingQuota = Math.max(totalQuota - usedQuota, 0);
  const totalFilesCount = Number(statistics?.totalFiles ?? files.length);
  const totalFoldersCount = Number(statistics?.totalFolders ?? 0);

  const handleDeleteFile = async (_id: string) => {
    try {
      await supprimerFichier(_id).unwrap();
      setFiles((prev) => prev.filter((f) => f._id !== _id));
      toast.success(
        "File moved to Corbeille. This is not a permanent delete. Delete permanently from Corbeille.",
      );
    } catch (err) {
      toast.error("Failed to move file to Corbeille.");
      console.error("Delete file error:", err);
    }
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
                  {totalFilesCount}
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
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nombre de dossiers
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {totalFoldersCount}
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
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Supprimer ici envoie le fichier vers Corbeille. Ce n&apos;est pas une suppression definitive. Pour supprimer definitivement, allez dans Corbeille et utilisez l&apos;action de suppression definitive.
          </div>
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
