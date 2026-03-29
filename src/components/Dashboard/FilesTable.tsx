
import { Download, Trash2, Lock, File } from "lucide-react";
import { Button } from "../ui/Button";




export default function FileTable({ files, onDelete }: FileListCardProps) {
 

  if (files.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <File className="text-slate-600 dark:text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Aucun fichier
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Commencez par téléverser votre premier fichier
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Fichier
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Taille
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Date d&apos;upload
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file._id}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <File className="text-blue-600 dark:text-blue-400" size={20} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {file.size} MB
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {file.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Lock className="text-green-600" size={16} />
                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      Chiffré AES
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      title="Télécharger"
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">Télécharger</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => onDelete(file._id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Supprimer</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">
            {files.length}
          </span>{" "}
          fichier{files.length > 1 ? "s" : ""} •{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {files.reduce((acc, f) => acc + f.size, 0).toFixed(1)} MB
          </span>{" "}
          utilisé
        </p>
      </div>
    </div>
  );
}
