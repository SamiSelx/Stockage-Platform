import { useGetFolderByIdQuery } from "@/app/backend/endpoints/folder";
import { Breadcrumb } from "@/components/MyDrive/BreadCrumb";
import { Outlet, useNavigate, useParams } from "react-router";

export function MyDriveLayout() {
  const params = useParams(); // folder id
  const navigate = useNavigate();
  console.log("id is ",params.folderId);
  

  const { data:folderData } = useGetFolderByIdQuery(params.folderId!, { skip: !params.folderId });
  const folder = (folderData?.data as FolderI) ?? {};

  const breadcrumbPath = params.folderId
    ? [{ id: "root", label: "My Drive" }, ...(folder.breadcrumb || [])]
    : [{ id: "root", label: "My Drive" }];

  const handleNavigate = (id: string) => {
    if (id === "root") {
      navigate("/dashboard/my-drive");
    } else {
      navigate(`/dashboard/my-drive/folders/${id}`);
    }
  };
  

  return (
    <>
      <Breadcrumb items={breadcrumbPath} onNavigate={handleNavigate} />

      <Outlet context={{folder}}/>
    </>
  );
}