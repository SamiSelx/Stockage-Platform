import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser as setUserState } from "../app/slices/user";
import type { RootState } from "../app/store";
import { clearSessionTotaly } from "@/utils/crypto";

export default function useUser(){
    const userInfo = useSelector((state:RootState) => state.user.user)
    const dispatch = useDispatch()


    function setUser(user:unknown){
        dispatch(setUserState(user))
    }

    function removeUser(){
        dispatch(clearUser())
        clearSessionTotaly()
    }

    return { user:userInfo, removeUser, setUser }
}