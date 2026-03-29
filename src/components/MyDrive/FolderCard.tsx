import { FolderIconComponent } from '@/constants/file-icons';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2, Edit, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { formatDate } from '@/utils/formatDate';
import useUser from '@/hooks/useUser';
import { useDeleteFolderMutation } from '@/app/backend/endpoints/folder';
import { toast } from 'sonner';

interface FolderCardProps {
  folder: FolderI;
  viewMode: 'grid' | 'list';
  onSelect?: (folderId: string) => void;
  isSelected?: boolean;
  onOpen?: (folder: FolderI) => void;
}

export function FolderCard({
  folder,
  viewMode,
  onSelect,
  isSelected = false,
  onOpen,
}: FolderCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {user} = useUser()
  const [deleteFolder] = useDeleteFolderMutation()
  
  async function handleDeleteFolder() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier "${folder.name}" ? Cette action ne peut pas être annulée.`)) {
      deleteFolder(folder.id)
      .unwrap()
      .then(() => {
        toast.success("Dossier supprimé avec succès")
      })
      .catch(() => {
        toast.error("Erreur lors de la suppression du dossier")
      });
      
    }
  }


  if (viewMode === 'list') {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="flex items-center gap-4 border-b border-border px-4 py-3 hover:bg-accent transition-colors cursor-pointer group"
            onClick={() => onOpen?.(folder)}
          >
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(folder.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <FolderIconComponent size={24} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{folder.name}</p>
              <p className="text-xs text-muted-foreground">
                {folder?.itemCount ?? 0} items
              </p>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {formatDate(new Date(folder.updatedAt))}
            </div>
            {/* <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-background rounded">
              <MoreVertical size={16} />
            </button> */}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onOpen?.(folder)}>
            <FolderOpen size={16} className="mr-2" />
            Open
          </ContextMenuItem>
          <ContextMenuItem>
            <Edit size={16} className="mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem className="text-red-600" onClick={handleDeleteFolder}>
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
          onClick={() => onOpen?.(folder)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Checkbox */}
          {onSelect && (
            <div
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(folder.id);
              }}
            >
              <Checkbox checked={isSelected} />
            </div>
          )}

          {/* More Menu */}
          {/* <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-background rounded">
            <MoreVertical size={16} />
          </button> */}

          {/* Folder Icon */}
          <div className="mb-3">
            <FolderIconComponent isOpen={isHovered} size={32} />
          </div>

          {/* Folder Info */}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate" title={folder.name}>
              {folder.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {folder?.itemCount ?? 0} items
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(folder.updatedAt))}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {folder?.owner.lastName} {folder?.owner.firstName} {folder?.owner._id === (user as UserI)?._id && "(You)"}
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onOpen?.(folder)}>
          <FolderOpen size={16} className="mr-2" />
          Open
        </ContextMenuItem>
        <ContextMenuItem>
          <Edit size={16} className="mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem className="text-red-600" onClick={handleDeleteFolder}>
          <Trash2 size={16} className="mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
