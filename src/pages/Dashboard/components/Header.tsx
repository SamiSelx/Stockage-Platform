import { Search, UploadCloud, Settings, Grid3x3, List } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useLogoutMutation } from "@/app/backend/endpoints/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import useUser from "@/hooks/useUser";

export default function Navbar({
  viewMode,
  onViewModeChange,
  onUpload,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  const navigate =  useNavigate()
  const {removeUser} = useUser()
  const [logout] = useLogoutMutation()


  async function handleLogout(){
      logout()
        .unwrap()
        .then((data) => { 
          removeUser()
          // navigate("/login")
          toast.success("Déconnexion réussie", {
            description: data.message
          });
         })
        .catch((err) => { 
          toast.error("Erreur lors de la déconnexion", {
            description: err.data?.error || "Une erreur est survenue"
          });
          navigate("/login")
          removeUser()
         })
    }
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="flex items-center justify-between gap-4 p-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search files"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rounded-full bg-accent border-0 focus-visible:ring-1 focus-visible:ring-muted-foreground"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/change-password" className="text-sm text-muted-foreground hover:text-foreground">
            change Password ?
          </Link>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === "grid"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
              title="Grid view"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === "list"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>

          {/* Upload Button */}
          <div>
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => onUpload(e.target.files ?? undefined)}
              multiple
            />
            <Button asChild variant="outline" size="icon" title="Upload files">
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadCloud size={18} />
              </label>
            </Button>
          </div>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              {/* <DropdownMenuItem>Help & feedback</DropdownMenuItem>
              <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem> */}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleLogout()}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
