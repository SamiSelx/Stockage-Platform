import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import navItems from "@/constants/navItems";
import { Plus } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLocation, useNavigate } from "react-router";

export default function Sidebar({ onNewFolder }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
          <div className="flex items-center justify-between gap-2">
            {isExpanded && (
              <div className="flex items-center gap-2">
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
            onClick={onNewFolder}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size={isExpanded ? "default" : "icon"}
          >
            <Plus size={18} />
            {isExpanded && <span className="ml-2 ">New folder</span>}
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
                <p className="font-medium">Storage</p>
                <p className="mt-1">12.5 GB of 15 GB used</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
                <div className="h-full w-[83%] bg-foreground"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
