import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layout/DashboardLayout";
import Overview from "./pages/Dashboard";
import MyDrive from "./pages/Dashboard/MyDrive";
import Recent from "./pages/Dashboard/Recent";
import Starred from "./pages/Dashboard/Starred";
import Trash from "./pages/Dashboard/Trash";


const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Overview /> }, // /dashboard
      { path: "my-drive", element: <MyDrive /> }, // /dashboard/my-drive
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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
