interface NavbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
