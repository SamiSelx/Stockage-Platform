import { useGetFilesQuery } from "@/app/backend/endpoints/file";
import { useGetFoldersQuery } from "@/app/backend/endpoints/folder";
import { FilePreviewModal } from "@/components/MyDrive/CreateFolderModel";
import { FileCard } from "@/components/MyDrive/FileCard";
import { FolderCard } from "@/components/MyDrive/FolderCard";
import { EmptyState } from "@/components/MyDrive/utility-components";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import useFile from "@/hooks/useFile";
import useFolder from "@/hooks/useFolder";
import { Download, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { toast } from "sonner";

export default function Folder() {
  const { folder } = useOutletContext<{
    viewMode: "grid" | "list";
    folder: FolderI;
  }>();
  const [selectedFile, setSelectedFile] = useState<FileI | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const { setShowCreateFolder, viewMode } = useFolder();
  const {handleBulkDownload} = useFile()

  // can use same api for folder and no need to use children
  const { data: filesResponse, isLoading: isFilesLoading } = useGetFilesQuery(
    folder.id,
    {
      skip: !folder.id,
    },
  );
  const { data: foldersResponse, isLoading: isFoldersLoading } =
    useGetFoldersQuery(folder.id, {
      skip: !folder.id,
    });
  const foldersData =
    (foldersResponse?.data as { currentParent: string; folders: FolderI[] }) ??
    [];

  const filesData =
    (filesResponse?.data as {
      currentFolder: string | null;
      files: FileI[];
      storage: { storageUsed: number; storageLimit: number };
    }) || [];
    const files = filesData.files || [];

  const navigate = useNavigate();

  const handleOpenFolder = (folder: FolderI) => {
    navigate(`/dashboard/my-drive/folders/${folder.id}`);
  };

  const handlePreviewFile = (file: FileI) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

   const handleSelectFile = (fileId: string) => {
      // selecting files or folders to perform actions like move or delete
      console.log("file selected ", fileId);
  
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId);
      } else {
        newSelected.add(fileId);
      }
      setSelectedFiles(newSelected);
    };
  
     const handleSelectAll = () => {
      setSelectedFiles(new Set(files?.map((f) => f.id)));
    };
  
     const handleDeselectAll = () => {
      setSelectedFiles(new Set());
    };
  
    async function handleDownloadSelected() {
       if (selectedFiles.size === 0) return;
        setIsDownloading(true);
  
       try{
  
        const filesToDownload = files?.filter((f) =>
          selectedFiles.has(f.id)
        ) || [];
        
        await handleBulkDownload(filesToDownload);
  
       }catch(err: unknown) {
        console.log("error ",err)
        toast.error("Failed to download selected files");
       }
       setIsDownloading(false);
    }
    

  if (isFilesLoading || isFoldersLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Button
          onClick={() => setShowCreateFolder(true)}
          className="self-end my-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={18} />
          Créer un dossier
        </Button>
        {selectedFiles.size > 0 && (
                  <Card className="mb-6 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDeselectAll}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={()=> handleSelectAll()}>
                          Select All
                        </Button>
                        <Button
                          onClick={handleDownloadSelected}
                          disabled={isDownloading}
                          className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          
                          {isDownloading ? <><Loader2 className="animate-spin w-4 h-4"/> Downloading...</> : <><Download className="w-4 h-4" /> Download Selected</>}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
        <div className={`${viewMode == "grid" ? "p-4" : "p-0"}`}>
          <div
            className={`${viewMode == "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "divide-y divide-border"}`}
          >
            {foldersData &&
              foldersData.folders?.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  viewMode={viewMode}
                  //   onSelect={handleSelectFile}
                  //   isSelected={selectedFiles.has(folder.id)}
                  onOpen={handleOpenFolder}
                />
              ))}
            {filesData &&
              filesData.files?.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  onSelect={handleSelectFile}
                  isSelected={selectedFiles.has(file.id)}
                  onPreview={handlePreviewFile}
                />
              ))}
          </div>
          {folder &&
            folder.children?.length === 0 &&
            filesData?.files?.length === 0 && (
              <div className="h-[60vh] w-full flex flex-col items-center justify-center text-muted-foreground">
                <EmptyState onCreateFolder={() => setShowCreateFolder(true)} />
              </div>
            )}
        </div>
      </div>
      <FilePreviewModal
        file={selectedFile}
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
      />
    </div>
  );
}
