interface FileI {
  id: string;
  filename: string;
  type: "pdf" | "image" | "document" | "spreadsheet" | "video" | "audio";
  size: number;
  owner: UserI;
  path: string;
  // encryptedData: string;
  file_iv: string;
  encryptedFK: string;
  fk_iv: string;
  mimetype: string;
  folderId?: string | null;
  shared?: boolean;
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

interface UploadFileI {
  encryptedData: string;
  file_iv: string;
  encryptedFK: string;
  fk_iv: string;
  mimetype: string;
  originalName: string;
  size: number
}

interface FileDataI{
  file: { filename: string; mimetype?: string };
  encryptedData: string;
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

// {
//     id: string;
//     name: string;
//     parentFolder: string | null;
//   } | null;
interface ListeFilesResponse {
  currentFolder: string;
  files: FileI[];
  storage: {
    storageUsed: number;
    storageLimit: number;
    storageRemaining: number;
  };
}

interface StatisticResponse {
  totalSharedFiles: number,
  sharedWithMe: number,
  totalSharedFolders?: number,
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