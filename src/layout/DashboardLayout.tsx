import Header from "@/pages/Dashboard/components/Header";
import Sidebar from "@/pages/Dashboard/components/Sidebar";
import { Outlet } from "react-router";
import { useState } from "react";

export default function DashboardLayout() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewFolder = () => {
    // Add new folder logic
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleUpload = () => {
    // Add upload logic
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex h-screen">
      <Sidebar onNewFolder={handleNewFolder} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onUpload={handleUpload}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* sidebar pages render here */}
        </main>
      </div>
    </div>
  );
}
