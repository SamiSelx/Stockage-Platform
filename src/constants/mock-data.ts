export interface File {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'spreadsheet' | 'video' | 'audio';
  size: number;
  dateModified: Date;
  owner: string;
}

export interface Folder {
  id: string;
  name: string;
  dateModified: Date;
  itemCount: number;
  owner: string;
}

export interface FileSystemItem {
  files: File[];
  folders: Folder[];
}

const sampleFiles: File[] = [
  {
    id: 'file-1',
    name: 'Q4 Financial Report.pdf',
    type: 'pdf',
    size: 2456000,
    dateModified: new Date('2024-03-15'),
    owner: 'You',
  },
  {
    id: 'file-2',
    name: 'Team Photo.jpg',
    type: 'image',
    size: 3200000,
    dateModified: new Date('2024-03-10'),
    owner: 'You',
  },
  {
    id: 'file-3',
    name: 'Project Proposal.docx',
    type: 'document',
    size: 512000,
    dateModified: new Date('2024-03-18'),
    owner: 'Sarah Chen',
  },
  {
    id: 'file-4',
    name: 'Budget 2024.xlsx',
    type: 'spreadsheet',
    size: 1024000,
    dateModified: new Date('2024-03-20'),
    owner: 'You',
  },
  {
    id: 'file-5',
    name: 'Product Demo.mp4',
    type: 'video',
    size: 156000000,
    dateModified: new Date('2024-03-12'),
    owner: 'Mark Johnson',
  },
  {
    id: 'file-6',
    name: 'Meeting Recording.mp3',
    type: 'audio',
    size: 45000000,
    dateModified: new Date('2024-03-08'),
    owner: 'You',
  },
  {
    id: 'file-7',
    name: 'Design System.pdf',
    type: 'pdf',
    size: 5120000,
    dateModified: new Date('2024-03-05'),
    owner: 'Alex Rivera',
  },
  {
    id: 'file-8',
    name: 'Presentation.pptx',
    type: 'document',
    size: 8192000,
    dateModified: new Date('2024-02-28'),
    owner: 'You',
  },
];

const sampleFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Projects',
    dateModified: new Date('2024-03-20'),
    itemCount: 12,
    owner: 'You',
  },
  {
    id: 'folder-2',
    name: 'Archive',
    dateModified: new Date('2024-03-01'),
    itemCount: 28,
    owner: 'You',
  },
  {
    id: 'folder-3',
    name: 'Shared with Me',
    dateModified: new Date('2024-03-18'),
    itemCount: 5,
    owner: 'Multiple',
  },
];

export const mockFileSystem: FileSystemItem = {
  files: sampleFiles,
  folders: sampleFolders,
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
