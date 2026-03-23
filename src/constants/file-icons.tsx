import {
  FileText,
  Image,
  File,
  Sheet,
  Video,
  Music2,
  Folder,
  FolderOpen,
} from 'lucide-react';

export type FileType = 'pdf' | 'image' | 'document' | 'spreadsheet' | 'video' | 'audio';

interface FileIconProps {
  type: FileType | 'folder';
  size?: number;
  className?: string;
}

export function FileIcon({ type, size = 24, className = '' }: FileIconProps) {
  const iconProps = {
    size,
    className: `text-muted-foreground ${className}`,
  };

  switch (type) {
    case 'pdf':
      return <FileText {...iconProps} />;
    case 'image':
      return <Image {...iconProps} />;
    case 'document':
      return <FileText {...iconProps} />;
    case 'spreadsheet':
      return <Sheet {...iconProps} />;
    case 'video':
      return <Video {...iconProps} />;
    case 'audio':
      return <Music2 {...iconProps} />;
    case 'folder':
      return <Folder {...iconProps} />;
    default:
      return <File {...iconProps} />;
  }
}

export function FolderIconComponent({
  isOpen = false,
  size = 24,
  className = '',
}: {
  isOpen?: boolean;
  size?: number;
  className?: string;
}) {
  const iconProps = {
    size,
    className: `text-muted-foreground ${className}`,
  };

  return isOpen ? <FolderOpen {...iconProps} /> : <Folder {...iconProps} />;
}

export function getFileColor(type: FileType): string {
  switch (type) {
    case 'pdf':
      return 'text-red-600';
    case 'image':
      return 'text-purple-600';
    case 'document':
      return 'text-blue-600';
    case 'spreadsheet':
      return 'text-green-600';
    case 'video':
      return 'text-orange-600';
    case 'audio':
      return 'text-pink-600';
    default:
      return 'text-gray-600';
  }
}
