import { useState, useMemo } from 'react';
import { Breadcrumb } from './Components/BreadCrumb';
import { CreateFolderModal, FilePreviewModal } from './Components/CreateFolderModel';
import { FileCard } from './Components/file-card';
// import { Sidebar } from '@/components/drive/sidebar';
// import { Navbar } from '@/components/drive/navbar';
// import { Breadcrumb } from '@/components/drive/breadcrumb';
// import { FileCard } from '@/components/drive/file-card';
// import { FolderCard } from '@/components/drive/folder-card';
// import { CreateFolderModal, FilePreviewModal } from '@/components/drive/modals';
// import { EmptyState, UploadZone } from '@/components/drive/utility-components';
// import { mockFileSystem, File, Folder } from '@/lib/mock-data';
import { type File, type Folder } from '@/constants/mock-data';
import { EmptyState, UploadZone } from './Components/utility-components';
import { mockFileSystem} from "@/constants/mock-data";
import { FolderCard } from './Components/folder-card';

export default function Drive() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeSection, setActiveSection] = useState('my-drive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; label: string }>
  >([{ id: 'my-drive', label: 'My Drive' }]);


//   const sectionContent = getSectionContent();

  // Filter files and folders based on search
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const folders = mockFileSystem.folders.filter((f) =>
      f.name.toLowerCase().includes(query)
    );
    const files = mockFileSystem.files.filter((f) =>
      f.name.toLowerCase().includes(query)
    );
    return { folders, files };
  }, [searchQuery, activeSection]);

  const handleSelectFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleCreateFolder = (name: string) => {
    console.log("name folder ", name);
    
    setShowCreateFolder(false);
  };

  const handlePreviewFile = (file: File) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleOpenFolder = (folder: Folder) => {
    console.log('Opening folder:', folder.name);
    setBreadcrumbPath([
      ...breadcrumbPath,
      { id: folder.id, label: folder.name },
    ]);
  };

  const handleBreadcrumbNavigate = (itemId: string) => {
    const index = breadcrumbPath.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
    }
  };

  const isEmpty = filteredItems.folders.length === 0 && filteredItems.files.length === 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Breadcrumb */}
        <Breadcrumb
          items={breadcrumbPath}
          onNavigate={handleBreadcrumbNavigate}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Empty State */}
          {isEmpty && activeSection !== 'trash' ? (
            <EmptyState
              onCreateFolder={() => setShowCreateFolder(true)}
              onUpload={() => console.log(' Upload clicked')}
            />
          ) : isEmpty && activeSection === 'trash' ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2 text-foreground">Trash is empty</h2>
                <p className="text-muted-foreground">Deleted files will appear here</p>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Zone */}
              <div className="p-4 border-b border-border bg-accent/30">
                <UploadZone onUpload={(files) => console.log('[v0] Files to upload:', files)} />
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Folders */}
                    {filteredItems.folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        viewMode="grid"
                        onSelect={handleSelectFile}
                        isSelected={selectedFiles.has(folder.id)}
                        onOpen={handleOpenFolder}
                      />
                    ))}
                    {/* Files */}
                    {filteredItems.files.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        viewMode="grid"
                        onSelect={handleSelectFile}
                        isSelected={selectedFiles.has(file.id)}
                        onPreview={handlePreviewFile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="divide-y divide-border">
                  {/* Folders */}
                  {filteredItems.folders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      viewMode="list"
                      onSelect={handleSelectFile}
                      isSelected={selectedFiles.has(folder.id)}
                      onOpen={handleOpenFolder}
                    />
                  ))}
                  {/* Files */}
                  {filteredItems.files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      viewMode="list"
                      onSelect={handleSelectFile}
                      isSelected={selectedFiles.has(file.id)}
                      onPreview={handlePreviewFile}
                    />
                  ))}
                </div>
              )}
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
