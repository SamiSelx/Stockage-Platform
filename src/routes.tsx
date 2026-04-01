import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layout/DashboardLayout";
import Overview from "./pages/Dashboard";
import Recent from "./pages/Dashboard/Recent";
import Starred from "./pages/Dashboard/Starred";
import Trash from "./pages/Dashboard/Trash";
import Drive from "./pages/Dashboard/MyDrive";
import TestCryptoPage from "./pages/test";

import Folder from "./pages/Dashboard/MyDrive/Folders/FolderDetails";
import Folders from "./pages/Dashboard/MyDrive/Folders";
import { MyDriveLayout } from "./pages/Dashboard/MyDrive/layout/MyDriveLayout";
import ProtectRoute from "./components/ProtectRoute";

const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <ProtectRoute><DashboardLayout /></ProtectRoute>,
    children: [
      { index: true, element: <Overview /> }, // /dashboard
      {
        path: "my-drive",
        element: <MyDriveLayout />,
        children: [
          {
            index: true,
            element: <Drive />,
          },
          {
            path: "folders",
            element: <Folders/>
          },
          {
            path: "folders/:folderId",
            element: <Folder />,
          },
        ]
      }, // /dashboard/my-drive
      
      { path: "recent", element: <Recent /> }, // /dashboard/recent
      { path: "starred", element: <Starred /> }, // /dashboard/starred
      { path: "trash", element: <Trash /> }, // /dashboard/trash
    ],
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/test",
    element: <TestCryptoPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
