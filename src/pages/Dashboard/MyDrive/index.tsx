import { useState, useMemo } from "react";
import { FilePreviewModal } from "@/components/MyDrive/CreateFolderModel";
import { FileCard } from "@/components/MyDrive/FileCard";
import {
  EmptyState,
  UploadZone,
} from "@/components/MyDrive/utility-components";
import { FolderCard } from "@/components/MyDrive/FolderCard";
import { useNavigate } from "react-router";
import { useGetFilesQuery, useGetSharedFilesQuery } from "@/app/backend/endpoints/file";
import { useGetFoldersQuery } from "@/app/backend/endpoints/folder";
import { Download, Loader2, X } from "lucide-react";
import useFolder from "@/hooks/useFolder";
import useFile from "@/hooks/useFile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function Drive() {
  const navigate = useNavigate()
  const {viewMode, searchQuery, setShowCreateFolder} = useFolder()
  const { handleUpload, handleBulkDownload } = useFile();

  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileI | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Api Get Folders & Files
  const {data: sharedFilesData} = useGetSharedFilesQuery()
  const {data: filesResponse, isLoading: isFilesLoading} = useGetFilesQuery(undefined)
  const {data: foldersResponse, isLoading: isFoldersLoading} = useGetFoldersQuery(undefined)
  const filesData = filesResponse?.data as {currentFolder: string; files: FileI[]; storage: {storageUsed: number; storageLimit: number}} || []
  const foldersData = foldersResponse?.data as { currentParent: string; folders: FolderI[] } ?? [];
  


  // Filter files and folders based on search
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const folders = foldersData.folders?.filter((f) =>
      f.name.toLowerCase().includes(query),
    );
    const ownedFiles =
  filesData.files?.filter((f) =>
    f.filename.toLowerCase().includes(query)
  ) || [];

const sharedFiles =
  sharedFilesData?.data
    ?.filter((sf) =>
      sf.fileId.filename.toLowerCase().includes(query)
    )
    .map((sf) => ({
      ...sf.fileId,
      shared: true,
      encryptedFK: sf.encryptedFK,
    })) || [];

const files = [...ownedFiles, ...sharedFiles];
    return { folders, files };
  }, [searchQuery,foldersData.folders,filesData.files, sharedFilesData?.data]);

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
    setSelectedFiles(new Set(filteredItems.files?.map((f) => f.id)));
  };

   const handleDeselectAll = () => {
    setSelectedFiles(new Set());
  };

  async function handleDownloadSelected() {
     if (selectedFiles.size === 0) return;
      setIsDownloading(true);

     try{

      const filesToDownload = filteredItems.files?.filter((f) =>
        selectedFiles.has(f.id)
      ) || [];
      
      await handleBulkDownload(filesToDownload);

     }catch(err: unknown) {
      console.log("error ",err)
      toast.error("Failed to download selected files");
     }
     setIsDownloading(false);
  }
  
  const handlePreviewFile = (file: FileI) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };
  

  const handleOpenFolder = (folder: FolderI) => {
    console.log("Opening folder:", folder);
    // setBreadcrumbPath([
    //   ...breadcrumbPath,
    //   { id: folder.id, label: folder.name },
    // ]);
    navigate(`/dashboard/my-drive/folders/${folder.id}`);
  };

  // const handleBreadcrumbNavigate = (itemId: string) => {
  //   const index = breadcrumbPath.findIndex((item) => item.id === itemId);
  //   if (index !== -1) {
  //     setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
  //   }
  // };

  const isEmpty =
    (filteredItems?.folders?.length ?? 0) === 0 &&
    filteredItems.files?.length === 0;

  if (isFilesLoading || isFoldersLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        {/* <Breadcrumb
          items={breadcrumbPath}
          onNavigate={handleBreadcrumbNavigate}
        /> */}
        <main className="flex-1 ">
          {/* Selection Toolbar */}
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
          {/* Empty State */}
          {isEmpty ? (
            <EmptyState onCreateFolder={() => setShowCreateFolder(true)} />
          ) : (
            <>
              {/* Upload Zone */}
              <div className="p-4 border-b border-border bg-accent/30">
                <UploadZone
                  onUpload={handleUpload}
                />
              </div>

              <div className={`${viewMode == "grid" ? "p-4" : "p-0"}`}>
                <div
                  className={`${viewMode == "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "divide-y divide-border"}`}
                >
                  {/* Folders */}
                  {foldersData &&
                    filteredItems.folders?.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        viewMode={viewMode}
                        onSelect={handleSelectFile}
                        isSelected={selectedFiles.has(folder.id)}
                        onOpen={handleOpenFolder}
                      />
                    ))}
                  {/* Files */}
                  {filteredItems.files?.map((file) => (
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
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {/* <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onConfirm={handleCreateFolder}
      /> */}
      <FilePreviewModal
        file={selectedFile}
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
      />
    </div>
  );
}
