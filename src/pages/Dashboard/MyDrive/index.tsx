import { useState, useMemo } from "react";
import {
  FilePreviewModal,
} from "@/components/MyDrive/CreateFolderModel";
import { FileCard } from "@/components/MyDrive/FileCard";
import {
  EmptyState,
  UploadZone,
} from "@/components/MyDrive/utility-components";
import { mockFileSystem } from "@/constants/mock-data";
import { FolderCard } from "@/components/MyDrive/FolderCard";
import { useNavigate } from "react-router";
import { useGetFilesQuery } from "@/app/backend/endpoints/file";
import { useGetFoldersQuery } from "@/app/backend/endpoints/folder";
import { Loader2 } from "lucide-react";
import useFolder from "@/hooks/useFolder";

export default function Drive() {
  const navigate = useNavigate()
  const {viewMode, searchQuery, setShowCreateFolder} = useFolder()
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileI | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);


  // Api Get Folders & Files
  const {data: filesData, isLoading: isFilesLoading} = useGetFilesQuery()
  const {data: foldersResponse, isLoading: isFoldersLoading} = useGetFoldersQuery()
  const files = filesData?.data || []
  const foldersData = foldersResponse?.data as { currentParent: string; folders: FolderI[] } ?? [];
  console.log("files , folders ",files,foldersData);
  
  // Filter folders and files based on breadcrumb path
  // Filter by search query from backend

  // Filter files and folders based on search
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const folders = foldersData.folders?.filter((f) =>
      f.name.toLowerCase().includes(query),
    );
    const files = mockFileSystem.files.filter((f) =>
      f.name.toLowerCase().includes(query),
    );
    return { folders, files };
  }, [searchQuery,foldersData.folders]);

 

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

  const isEmpty = (filteredItems?.folders?.length ?? 0) === 0 && filteredItems.files.length === 0;

  if(isFilesLoading || isFoldersLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
          <Loader2 className="animate-spin" size={24}/>
      </div>
    )
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
          {/* Empty State */}
          {isEmpty ? (
            <EmptyState
              onCreateFolder={() => setShowCreateFolder(true)}
              onUpload={() => console.log("Upload clicked")}
            />
          ) : (
            <>
              {/* Upload Zone */}
              <div className="p-4 border-b border-border bg-accent/30">
                <UploadZone
                  onUpload={(files) => console.log(" Files to upload:", files)}
                />
              </div>

              <div className={`${viewMode == "grid" ? "p-4" : "p-0"}`}>
                <div
                  className={`${viewMode == "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "divide-y divide-border"}`}
                >
                  {/* Folders */}
                  {foldersData && filteredItems.folders?.map((folder) => (
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
                  {filteredItems.files.map((file) => (
                    <FileCard
                      key={file._id}
                      file={file}
                      viewMode={viewMode}
                      onSelect={handleSelectFile}
                      isSelected={selectedFiles.has(file._id)}
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
