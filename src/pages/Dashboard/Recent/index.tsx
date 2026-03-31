import { useState } from "react";
import FileTable from "@/components/Dashboard/FilesTable";
import { useGetRecentFilesQuery } from "@/app/backend/endpoints/file";

export default function Recent() {
  const [search, setSearch] = useState("");
  const { data: recentFiles } = useGetRecentFilesQuery();

  const files = recentFiles?.data?.files || [];
 

  const handleDelete = (fileId: string) => {
    console.log("Delete file:", fileId);
  };

   
      const filteredFiles = files.filter((file: FileI) =>
        file.name.toLowerCase().includes(search.toLowerCase())
      );



  return (
    <div className="p-6 space-y-6">
      {/*  Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recent Files</h1>
          <p className="text-gray-500 text-sm">
            Quickly access your latest uploaded or modified files
          </p>
        </div>

        {/*  Search */}
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-xl w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      

      {/*  Table container */}
      <div className="bg-white rounded-2xl shadow p-4">
        {
          filteredFiles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No recent files found.</p>
            </div>
          ) : (
            <FileTable files={filteredFiles} onDelete={handleDelete} />
          )
        }
          
      
      </div>
    </div>
  );
}