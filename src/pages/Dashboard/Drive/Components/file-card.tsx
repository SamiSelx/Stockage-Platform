import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { MoreVertical, Download, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { useState } from 'react';
import { FileIcon } from '@/constants/file-icons';
import { formatDate, formatFileSize } from '@/constants/mock-data';
import { type File } from '@/constants/mock-data';


interface FileCardProps {
  file: File;
  viewMode: 'grid' | 'list';
  onSelect?: (fileId: string) => void;
  isSelected?: boolean;
  onPreview?: (file: File) => void;
}

export function FileCard({
  file,
  viewMode,
  onSelect,
  isSelected = false,
  onPreview,
}: FileCardProps) {
//   const [showContextMenu, setShowContextMenu] = useState(false);

  if (viewMode === 'list') {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="flex items-center gap-4 border-b border-border px-4 py-3 hover:bg-accent transition-colors cursor-pointer group"
            onClick={() => onPreview?.(file)}
          >
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(file.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <FileIcon type={file.type} size={24} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {file.owner} • {formatFileSize(file.size)}
              </p>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {formatDate(file.dateModified)}
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-background rounded">
              <MoreVertical size={16} />
            </button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onPreview?.(file)}>
            <FileIcon type={file.type} size={16} className="mr-2" />
            Preview
          </ContextMenuItem>
          <ContextMenuItem>
            <Download size={16} className="mr-2" />
            Download
          </ContextMenuItem>
          <ContextMenuItem>
            <Edit size={16} className="mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem className="text-red-600">
            <Trash2 size={16} className="mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Grid view
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'relative group cursor-pointer rounded-lg border border-border p-4 hover:bg-accent transition-colors',
            isSelected && 'bg-accent border-foreground'
          )}
          onClick={() => onPreview?.(file)}
        >
          {/* Checkbox */}
          {onSelect && (
            <div
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(file.id);
              }}
            >
              <Checkbox checked={isSelected} />
            </div>
          )}

          {/* More Menu */}
          <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-background rounded">
            <MoreVertical size={16} />
          </button>

          {/* Icon */}
          <div className="mb-3">
            <FileIcon type={file.type} size={32} />
          </div>

          {/* File Info */}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatFileSize(file.size)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(file.dateModified)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {file.owner}
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onPreview?.(file)}>
          <FileIcon type={file.type} size={16} className="mr-2" />
          Preview
        </ContextMenuItem>
        <ContextMenuItem>
          <Download size={16} className="mr-2" />
          Download
        </ContextMenuItem>
        <ContextMenuItem>
          <Edit size={16} className="mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem className="text-red-600">
          <Trash2 size={16} className="mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
