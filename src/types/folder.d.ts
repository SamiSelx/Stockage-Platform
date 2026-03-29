interface FolderI {
  id: string;
  name: string;
  itemCount?: number;
  owner: UserI;
  parentFolder?: string | null;
  children?: FolderI[];
  createdAt: Date;
  updatedAt: Date;
  breadcrumb?: Array<{ id: string; label: string }>;
}
