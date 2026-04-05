import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { FileIcon } from '@/constants/file-icons';
import { useState } from 'react';
// import { X } from 'lucide-react';
import { formatFileSize } from '@/utils/formatFileSize';
import { formatDate } from '@/utils/formatDate';
import { useParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import useUser from '@/hooks/useUser';
import useFile from '@/hooks/useFile';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, parentId?: string) => void;
  isLoading:boolean
}

export function CreateFolderModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('New folder');
  const param = useParams()

  const handleConfirm = () => {
    if (folderName.trim()) {
      onConfirm(folderName, param.folderId);
      setFolderName('New folder');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Folder name</label>
            <Input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
              }}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='animate-spin'/>
                  Creating...
                </>
              ) : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FilePreviewModalProps {
  file: FileI | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
}: FilePreviewModalProps) {
  const { user } = useUser()
  const {handleDownload} = useFile()

  if (!file) return null;
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{file.filename}</DialogTitle>
          <DialogDescription>
            Preview and details for {file.filename}
          </DialogDescription>
        </DialogHeader>
        {/* <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-accent rounded transition-colors"
        >
          <X size={20} />
        </button> */}

        <div className="space-y-4">
          {/* Preview Area */}
          <div className="bg-accent rounded-lg p-8 min-h-64 flex items-center justify-center">
            <div className="text-center">
              <FileIcon type={file.type} size={64} className="mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {file.type === 'image'
                  ? '[Image preview would display here]'
                  : `[${file.mimetype.toUpperCase()} preview would display here]`}
              </p>
            </div>
          </div>

          {/* File Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium break-words">{file.filename}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-medium">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{file.mimetype.split("/")[1]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Modified</p>
              <p className="font-medium">{formatDate(new Date(file.updatedAt))}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Owner</p>
              <p className="font-medium">{file.owner.lastName} {file.owner.firstName} ({file.owner._id == (user as UserI)._id ? "You" : ""})</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleDownload(file)}>
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
