interface NavbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onUpload: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
