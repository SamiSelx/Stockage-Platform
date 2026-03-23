interface FolderI {
  _id: string;
  name: string;
  itemCount: number;
  owner: string;
  parentFolderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
