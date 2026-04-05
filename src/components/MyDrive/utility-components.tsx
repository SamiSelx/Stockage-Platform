import { Upload, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import useFile from '@/hooks/useFile';


interface EmptyStateProps {
  onCreateFolder: () => void;
}

export function EmptyState({ onCreateFolder }: EmptyStateProps) {
  const {handleUpload} = useFile()
  return (
    <div className="flex flex-col items-center justify-center min-h-96 py-12">
      <FolderPlus size={48} className="text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Aucun fichier ou dossier ici</h3>
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
                    onChange={(e) => handleUpload(e)}
                    multiple
                  />
                  <Button title="Upload files" className='bg-blue-600 hover:bg-blue-700'>
                    <label htmlFor="file-upload" className="flex items-center cursor-pointer">
                      <Upload size={18} className="mr-2" />
        Télécharger des fichiers
                    </label>
                  </Button>
                </div>
      </div>
  );
}

interface UploadZoneProps {
  onUpload: (files: FileList) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const {handleUpload} = useFile()
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // handleUpload(e.dataTransfer.files[0])
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUpload(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-foreground/20 transition-colors bg-accent/50"
    >
      <Upload size={32} className="text-muted-foreground mx-auto mb-3" />
      <p className="font-medium mb-1">Drag files here to upload</p>
      <p className="text-sm text-muted-foreground mb-4">
        or click the upload button
      </p>
      <Input type="file" id="file-upload" className="hidden" onChange={(e) => handleUpload(e)} />
      <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
        <Upload size={18} />
        Select files
      </Label>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3 animate-pulse">
          <div className="h-8 w-8 bg-accent rounded"></div>
          <div className="h-4 bg-accent rounded w-3/4"></div>
          <div className="h-3 bg-accent rounded w-1/2"></div>
          <div className="h-3 bg-accent rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
