export interface FolderNode {
  name: string;
  path: string; // full relative path e.g. "myFolder/sub/deep"
  files: File[];
  children: FolderNode[];
}

export function buildFolderTree(files: FileList): FolderNode {
  const root: FolderNode = { name: "", path: "", files: [], children: [] };

  for (const file of Array.from(files)) {
    // e.g. "myFolder/images/photo.png"
    const parts = file.webkitRelativePath.split("/");
    let current = root;

    // parts[0] = root folder name, parts[last] = filename
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          files: [],
          children: [],
        };
        current.children.push(child);
      }
      current = child;
    }
    current.files.push(file);
  }

  // The real root is the single top-level child
  return root.children[0] ?? root;
}

// Builds FolderNode tree from { file, path }[] instead of FileList
export function buildFolderTreeFromPaths(entries: { file: File; path: string }[], rootName: string): FolderNode {
  const root: FolderNode = { name: rootName, path: rootName, files: [], children: [] };

  for (const { file, path } of entries) {
    const parts = path.split("/");
    let current = root;

    // parts[0] = root folder, parts[last] = filename
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i];
      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          files: [],
          children: [],
        };
        current.children.push(child);
      }
      current = child;
    }
    current.files.push(file);
  }

  return root;
}

export const traverseFileTree = async (
  item: FileSystemEntry,
  path = ""
): Promise<Array<{ file: File; path: string }>> => {
  const files: Array<{ file: File; path: string }> = [];

  if (item.isFile) {
    const file = await new Promise<File>((resolve) =>
      (item as FileSystemFileEntry).file(resolve)
    );
    files.push({ file, path: path ? `${path}/${file.name}` : file.name });

  } else if (item.isDirectory) {
    const reader = (item as FileSystemDirectoryEntry).createReader();
    const newPath = path ? `${path}/${item.name}` : item.name;

    // Must loop — readEntries returns max 100 entries per call
    let batch: FileSystemEntry[] = [];
    do {
      batch = await new Promise<FileSystemEntry[]>((resolve) =>
        reader.readEntries(resolve)
      );
      for (const entry of batch) {
        const extracted = await traverseFileTree(entry, newPath);
        files.push(...extracted);
      }
    } while (batch.length > 0);
  }

  return files;
};