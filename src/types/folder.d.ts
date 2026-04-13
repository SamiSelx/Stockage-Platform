interface FolderI {
  id: string;
  name: string;
  owner: UserI;
  parentFolder?: string | null;
  children?: FolderI[];
  createdAt: Date;
  updatedAt: Date;
  breadcrumb?: Array<{ id: string; label: string }>;
  filesCount?: number;
  foldersCount?: number;
  itemsCount?: number;
}
