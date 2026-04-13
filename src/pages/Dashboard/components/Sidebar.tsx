import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import navItems from "@/constants/navItems";
import { Plus } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLocation, useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import useFolder from "@/hooks/useFolder";
import { useGetStatisticsQuery } from "@/app/backend/endpoints/file";
import useUser from "@/hooks/useUser";
import { formatFileSize } from "@/utils/formatFileSize";

export default function Sidebar() {
  const { setShowCreateFolder } = useFolder();
  const [isExpanded, setIsExpanded] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { data: statisticsData } = useGetStatisticsQuery();
  const statistics = statisticsData?.data;

  const bytesToMB = (value: number) => value / (1024 * 1024);
  const usedQuotaBytes = Number(
    statistics?.storage?.used ?? (user as UserI)?.storageUsed ?? 0,
  );
  const totalQuotaBytes = Number(
    statistics?.storage?.total ??
      (user as UserI)?.storageLimit ??
      1024 * 1024 * 1024,
  );
  const usedQuota = bytesToMB(usedQuotaBytes);
  const totalQuota = bytesToMB(totalQuotaBytes);
  // const remainingQuota = Math.max(totalQuota - usedQuota, 0);
  const usagePercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isMobile]);

  return (
    <aside
      className={cn(
        "border-r border-border bg-background transition-all duration-300",
        isExpanded ? "w-64" : "w-20",
      )}
    >
      <div className="flex h-screen flex-col">
        {/*mini header */}
        <div className="border-b border-border p-4">
          <div
            className={`flex items-center  gap-2 ${!isExpanded ? "justify-center" : "justify-between"}`}
          >
            {isExpanded && (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                <img src={logo} alt="CryptoDrive" className="h-6 w-6" />
                <span className="font-semibold text-sm">CryptoDrive</span>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded hover:bg-accent p-1 transition-colors"
            >
              {isExpanded ? "←" : "→"}
            </button>
          </div>
        </div>

        {/* New Folder Button */}
        <div className="flex items-center justify-center p-3 border-b border-border text-white">
          <Button
            onClick={() => setShowCreateFolder(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size={isExpanded ? "default" : "icon"}
          >
            <Plus size={18} />
            {isExpanded && <span className="ml-2 ">Nouveau dossier</span>}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === `/dashboard/${item.id}`;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(`/dashboard/${item.id}`)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon size={20} />
                {isExpanded && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Storage Info ---make it dynamic in the future */}
        {isExpanded && (
          <div className="border-t border-border p-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Stockage</p>
                <p className="mt-1">
                  {formatFileSize(usedQuotaBytes)} sur{" "}
                  {formatFileSize(totalQuotaBytes)} utilisé
                </p>
              </div>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Utilisation
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
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
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
