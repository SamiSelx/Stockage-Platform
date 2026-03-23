import { RouterProvider } from "react-router";
import router from "./routes";
import { useGetUserMutation } from "./app/backend/endpoints/auth";
import useUser from "./hooks/useUser";
import { useEffect } from "react";
import { Toaster } from "./components/ui/sonner";

function App() {
  const { setUser, removeUser } = useUser()
  const [getUser] = useGetUserMutation()

  useEffect(()=>{
    getUser()
      .unwrap()
      .then((res) => {
        setUser(res.data)
      })
      .catch(() => {
        removeUser()
      });
  },[])


  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors style={{textAlign:"start"}}/>
    </>
  );
}

export default App;
