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
}

//tableau des fichiers pour le dashboard
interface FileListCardProps {
  files: FileI[];
  onDelete: (id: string) => void;
}
