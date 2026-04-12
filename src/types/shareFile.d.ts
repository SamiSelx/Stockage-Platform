
interface FileShareI {
  fileId: FileI;
  recipientId: Types.ObjectId;
  encryptedFK: string;
  isArchived?: boolean;
  archivedAt?: Date | null;
  isStarred?: boolean;
  lastOpenedAt?: Date | null;
  openedCount?: number;
//   fk_iv: string;
  createdAt?: Date;
  updatedAt?: Date;
}