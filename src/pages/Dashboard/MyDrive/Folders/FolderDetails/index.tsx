import { FolderCard } from "@/components/MyDrive/FolderCard";
import { EmptyState } from "@/components/MyDrive/utility-components";
import { Button } from "@/components/ui/Button";
import useFolder from "@/hooks/useFolder";
import { Plus } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";

export default function Folder() {
  const { folder } = useOutletContext<{
    viewMode: "grid" | "list";
    folder: FolderI;
  }>();
  const { setShowCreateFolder, viewMode } = useFolder();
  const navigate = useNavigate();
  //   const { data: folderData } = useGetFolderByIdQuery(params.folderId!);
  //   const folder = (folderData?.data as FolderI) ?? {};
  // const [createFolder] = useCreateFolderMutation();

  const handleOpenFolder = (folder: FolderI) => {
    navigate(`/dashboard/my-drive/folders/${folder.id}`);
  };


  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Button onClick={() => setShowCreateFolder(true)} className="self-end my-2 bg-blue-600 hover:bg-blue-700">
            <Plus size={18} />
          Créer un dossier
        </Button>
        {folder &&
          folder.children?.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              viewMode={viewMode}
              //   onSelect={handleSelectFile}
              //   isSelected={selectedFiles.has(folder.id)}
              onOpen={handleOpenFolder}
            />
          ))}
          {folder && folder.children?.length === 0 && (
            <div className="h-[60vh] w-full flex flex-col items-center justify-center text-muted-foreground">
              <EmptyState
                onCreateFolder={() => setShowCreateFolder(true)}
                onUpload={() => console.log("Upload clicked")}
              />
            </div>)}
      </div>
    </div>
  );
}
