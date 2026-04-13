import { Upload, FolderPlus, FolderUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import useFile from "@/hooks/useFile";
import {  useState } from "react";
import { Spinner } from "../ui/spinner";
import {
  buildFolderTree,
  buildFolderTreeFromPaths,
  traverseFileTree,
} from "@/utils/builderFolderTree";

interface EmptyStateProps {
  onCreateFolder: () => void;
}

export function EmptyState({ onCreateFolder }: EmptyStateProps) {
  const { handleUpload } = useFile();
  return (
    <div className="flex flex-col items-center justify-center min-h-96 py-12">
      <FolderPlus size={48} className="text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Aucun fichier ou dossier ici
      </h3>
      <p className="text-muted-foreground text-sm mb-6 text-center">
        Créez un nouveau dossier ou téléchargez des fichiers pour commencer
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCreateFolder}>
          <FolderPlus size={18} className="mr-2" />
          Nouveau dossier
        </Button>
        {/* <Button onClick={(e)=> handleUpload(e)} className="bg-blue-600 hover:bg-blue-700">
        <Upload size={18} className="mr-2" />
        Télécharger des fichiers
      </Button>
      <div> */}
        <Input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files ?? undefined)}
          multiple
        />
        <Button title="Upload files" className="bg-blue-600 hover:bg-blue-700">
          <label
            htmlFor="file-upload"
            className="flex items-center cursor-pointer"
          >
            <Upload size={18} className="mr-2" />
            Télécharger des fichiers
          </label>
        </Button>
      </div>
    </div>
  );
}

interface UploadZoneProps {
  onUpload: (files?: File | FileList | File[]) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
const [fileInputKey, setFileInputKey] = useState(0);
const [folderInputKey, setFolderInputKey] = useState(0);
  const { handleUpload, handleFolderUpload } = useFile();
  onUpload();

  const [isUploading, setIsUploading] = useState(false);

  const handleUploadFile = async (files?: File | FileList | File[]) => {
    if (!files) return;

    setIsUploading(true);

    try {
      const start = Date.now();      

      if (handleUpload) {        
        await handleUpload(files);
      } else {
        console.log("Uploading file(s):", files);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const minTime = 1500;
      const elapsed = Date.now() - start;

      if (elapsed < minTime) {
        await new Promise((resolve) => setTimeout(resolve, minTime - elapsed));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // const handleDrop = async (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   await handleUploadFile(e.dataTransfer.files ?? undefined);
  // };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const entries: FileSystemEntry[] = [];
    const items = e.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) entries.push(entry);
    }

    // Now safe to go async
    const plainFiles: File[] = [];

    for (const entry of entries) {
      if (entry.isDirectory) {
        const extracted = await traverseFileTree(entry, "");
        const tree = buildFolderTreeFromPaths(extracted, entry.name);
        await handleFolderUpload?.(tree);
      } else if (entry.isFile) {
        const file = await new Promise<File>((resolve) =>
          (entry as FileSystemFileEntry).file(resolve),
        );
        plainFiles.push(file);
      }
    }

    if (plainFiles.length > 0) {
      await handleUploadFile(plainFiles);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleUploadFile(e.target.files ?? undefined);
    setFileInputKey(prev => prev + 1); 
    // if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Build a tree from the flat list webkitRelativePath gives us
    const folderTree = buildFolderTree(files);
    await handleFolderUpload(folderTree);
    setFolderInputKey(prev => prev + 1); 
    //  if (folderInputRef.current) folderInputRef.current.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-foreground/20 transition-colors bg-accent/50"
    >
      {isUploading ? (
        <>
          <Spinner className="mx-auto mb-3 size-8" />
          <p className="font-medium mb-1">Uploading...</p>
          <p className="text-sm text-muted-foreground">
            Please wait while your file is being uploaded
          </p>
        </>
      ) : (
        <>
          <Upload size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">
            Déposez des fichiers ou dossiers ici pour téléverser
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Déposez des fichiers ou dossiers ici ou utilisez les boutons
            ci-dessous
          </p>
          <Input
            // ref={fileInputRef}
            key={fileInputKey}
            type="file"
            id={`file-upload-${fileInputKey}`}
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Label
            htmlFor={`file-upload-${fileInputKey}`}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            Select files
          </Label>
          <Input
            // ref={folderInputRef}
            type="file"
            id={`folder-upload-${folderInputKey}`}
            className="hidden"
            onChange={handleFolderSelect}
            // @ts-expect-error – non-standard but widely supported
            webkitdirectory=""
            multiple
          />
          <Label
            htmlFor={`folder-upload-${folderInputKey}`}
            className="ml-4 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FolderUp size={18} />
            Select folder
          </Label>
        </>
      )}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border p-4 space-y-3 animate-pulse"
        >
          <div className="h-8 w-8 bg-accent rounded"></div>
          <div className="h-4 bg-accent rounded w-3/4"></div>
          <div className="h-3 bg-accent rounded w-1/2"></div>
          <div className="h-3 bg-accent rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
