interface FileI {
  _id: string;
  name: string;
  type: "pdf" | "image" | "document" | "spreadsheet" | "video" | "audio";
  size: number;
  owner: string;
  path: string;
  folderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  isArchived: boolean;
}

//tableau des fichiers pour le dashboard
interface FileListCardProps {
  files: FileI[];
  onDelete: (id: string) => void;
}

//for API responses
interface GetRecentFilesResponse {
  files: FileI[];
};
interface GetStarredFilesResponse {
  files: FileI[];
}
interface GetTrashFilesResponse {
  files: FileI[];
}

interface ListeFilesResponse {
  currentFolder: {
    id: string;
    name: string;
    parentFolder: string | null;
  } | null;
  files: FileI[];
  storage: {
    storageUsed: number;
    storageLimit: number;
    storageRemaining: number;
  };
}

interface StatisticResponse {
  totalFiles: number,
  totalFolders: number,
  archivedFiles: number,
  archivedFolders: number,
  starredFiles: number,
  openedFiles: number,
  storage: {
    used: number,
    total: number,
    remaining: number
  }
}