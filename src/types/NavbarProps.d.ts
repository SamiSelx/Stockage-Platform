interface NavbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onUpload: (
    files?: File | FileList | File[],
    // e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
