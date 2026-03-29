import { HardDrive } from "lucide-react";

export default function StorageQuotaCard({
  used,
  total,
  remaining,
}: StorageQuotaCardProps) {
  const usagePercentage = (used / total) * 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Quota d&apos;espace
        </h3>
        <HardDrive className="text-blue-600" size={24} />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Utilisation
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {usagePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Storage Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Utilisé</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {used.toFixed(1)} MB
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Restant</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {remaining.toFixed(1)} MB
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-400">Total</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {total} MB
          </span>
        </div>
      </div>

      {/* Warning if over 80% */}
      {usagePercentage > 80 && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-700 dark:text-orange-400">
             Votre quota de stockage est presque saturé
          </p>
        </div>
      )}
    </div>
  );
}
