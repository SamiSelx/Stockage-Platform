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
  createdAt: Date;
  updatedAt: Date;
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