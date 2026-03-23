import { useState, useMemo } from "react";
import { Breadcrumb } from "@/components/MyDrive/BreadCrumb";
import {
  CreateFolderModal,
  FilePreviewModal,
} from "@/components/MyDrive/CreateFolderModel";
import { FileCard } from "@/components/MyDrive/FileCard";
import {
  EmptyState,
  UploadZone,
} from "@/components/MyDrive/utility-components";
import { mockFileSystem } from "@/constants/mock-data";
import { FolderCard } from "@/components/MyDrive/FolderCard";
import { useOutletContext } from "react-router";

export default function Drive() {
  const { viewMode, searchQuery } = useOutletContext<{
    viewMode: "grid" | "list";
    searchQuery: string;
  }>();
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileI | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; label: string }>
  >([{ id: "my-drive", label: "My Drive" }]);

  // Api Create folder

  // Api Get Folders & Files
  // Filter folders and files based on breadcrumb path
  // Filter by search query from backend

  // Filter files and folders based on search
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const folders = mockFileSystem.folders.filter((f) =>
      f.name.toLowerCase().includes(query),
    );
    const files = mockFileSystem.files.filter((f) =>
      f.name.toLowerCase().includes(query),
    );
    return { folders, files };
  }, [searchQuery]);

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

  // Api call to create folder
  const handleCreateFolder = (name: string) => {
    console.log("name folder ", name);
    // Call API to create folder
    setShowCreateFolder(false);
  };

  const handlePreviewFile = (file: FileI) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleOpenFolder = (folder: FolderI) => {
    console.log("Opening folder:", folder.name);
    setBreadcrumbPath([
      ...breadcrumbPath,
      { id: folder._id, label: folder.name },
    ]);
  };

  const handleBreadcrumbNavigate = (itemId: string) => {
    const index = breadcrumbPath.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
    }
  };

  const isEmpty =
    filteredItems.folders.length === 0 && filteredItems.files.length === 0;

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          items={breadcrumbPath}
          onNavigate={handleBreadcrumbNavigate}
        />
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
                  {filteredItems.folders.map((folder) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      viewMode={viewMode}
                      onSelect={handleSelectFile}
                      isSelected={selectedFiles.has(folder._id)}
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
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onConfirm={handleCreateFolder}
      />
      <FilePreviewModal
        file={selectedFile}
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
      />
    </div>
  );
}

{
  /* List View */
}
// {viewMode === 'list' && (
//   <div className="divide-y divide-border">
//     {/* Folders */}
//     {filteredItems.folders.map((folder) => (
//       <FolderCard
//         key={folder.id}
//         folder={folder}
//         viewMode="list"
//         onSelect={handleSelectFile}
//         isSelected={selectedFiles.has(folder.id)}
//         onOpen={handleOpenFolder}
//       />
//     ))}
//     {/* Files */}
//     {filteredItems.files.map((file) => (
//       <FileCard
//         key={file.id}
//         file={file}
//         viewMode="list"
//         onSelect={handleSelectFile}
//         isSelected={selectedFiles.has(file.id)}
//         onPreview={handlePreviewFile}
//       />
//     ))}
//   </div>
// )}
