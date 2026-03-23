export interface FileSystemItem {
  files: FileI[];
  folders: FolderI[];
}

const sampleFiles: FileI[] = [
  {
    _id: 'file-1',
    name: 'Q4 Financial Report.pdf',
    type: 'pdf',
    size: 2456000,
    updatedAt: new Date('2024-03-15'),
    owner: 'You',
    createdAt: new Date('2024-03-01'),
    path: '/Q4 Financial Report.pdf',
  },
  {
    _id: 'file-2',
    name: 'Team Photo.jpg',
    type: 'image',
    size: 3200000,
    updatedAt: new Date('2024-03-10'),
    owner: 'You',
    createdAt: new Date('2024-03-01'),
    path: '/Team Photo.jpg',
  },
  {
    _id: 'file-3',
    name: 'Project Proposal.docx',
    type: 'document',
    size: 512000,
    updatedAt: new Date('2024-03-18'),
    owner: 'Sarah Chen',
    createdAt: new Date('2024-03-01'),
    path: '/Project Proposal.docx',

  },
  {
    _id: 'file-4',
    name: 'Budget 2024.xlsx',
    type: 'spreadsheet',
    size: 1024000,
    updatedAt: new Date('2024-03-20'),
    owner: 'You',
    createdAt: new Date('2024-03-01'),
    path: '/Budget 2024.xlsx',
  },
  {
    _id: 'file-5',
    name: 'Product Demo.mp4',
    type: 'video',
    size: 156000000,
    updatedAt: new Date('2024-03-12'),
    owner: 'Mark Johnson',
    createdAt: new Date('2024-03-01'),
    path: '/Product Demo.mp4',
  },
  {
    _id: 'file-6',
    name: 'Meeting Recording.mp3',
    type: 'audio',
    size: 45000000,
    updatedAt: new Date('2024-03-08'),
    owner: 'You',
    createdAt: new Date('2024-03-01'),
    path: '/Meeting Recording.mp3',

  },
  {
    _id: 'file-7',
    name: 'Design System.pdf',
    type: 'pdf',
    size: 5120000,
    updatedAt: new Date('2024-03-05'),
    owner: 'Alex Rivera',
    createdAt: new Date('2024-03-01'),
    path: '/Design System.pdf',
  },
  {
    _id: 'file-8',
    name: 'Presentation.pptx',
    type: 'document',
    size: 8192000,
    updatedAt: new Date('2024-02-28'),
    owner: 'You',
    createdAt: new Date('2024-02-01'),
    path: '/Presentation.pptx',
    folderId: null,
  },
];

const sampleFolders: FolderI[] = [
  {
    _id: 'folder-1',
    name: 'Projects',
    updatedAt: new Date('2024-03-20'),
    itemCount: 12,
    owner: 'You',
    createdAt: new Date('2024-03-01'),
  },
  {
    _id: 'folder-2',
    name: 'Archive',
    updatedAt: new Date('2024-03-01'),
    itemCount: 28,
    owner: 'You',
    createdAt: new Date('2024-02-01'),
  },
  {
    _id: 'folder-3',
    name: 'Shared with Me',
    updatedAt: new Date('2024-03-18'),
    itemCount: 5,
    owner: 'Multiple',
    createdAt: new Date('2024-01-15'),
  },
];

export const mockFileSystem: FileSystemItem = {
  files: sampleFiles,
  folders: sampleFolders,
};

