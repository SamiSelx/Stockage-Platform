import Header from "@/pages/Dashboard/components/Header";
import Sidebar from "@/pages/Dashboard/components/Sidebar";
import { Outlet } from "react-router";
import { useCreateFolderMutation } from "@/app/backend/endpoints/folder";
import useFolder from "@/hooks/useFolder";
import { CreateFolderModal } from "@/components/MyDrive/CreateFolderModel";
import { toast } from "sonner";
import useFile from "@/hooks/useFile";

export default function DashboardLayout() {
  const [createFolder, {isLoading: isCreatingFolder}] = useCreateFolderMutation();
  const {handleUpload} = useFile()
  const {showCreateFolder, setShowCreateFolder, viewMode, searchQuery, setViewMode, setSearchQuery} = useFolder();
  

  async function handleCreateFolder(name: string, parentId?: string) {
    createFolder({ name, parentFolder: parentId })
      .unwrap()
      .then(() => {
        setShowCreateFolder(false);
      })
      .catch((err) => {
        toast.error(err.data.message || "Impossible de créer le dossier");
      });
  }
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };


  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onUpload={handleUpload}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <main className="flex-1 overflow-y-auto ">
          <Outlet /> {/* sidebar pages render here */}
        </main>
        <CreateFolderModal
            isOpen={showCreateFolder}
            onClose={() => setShowCreateFolder(false)}
            onConfirm={handleCreateFolder}
            isLoading= {isCreatingFolder}
          />
      </div>
    </div>
  );
}
