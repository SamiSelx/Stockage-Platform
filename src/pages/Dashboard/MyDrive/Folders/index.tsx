import { useEffect } from "react"
import { useNavigate } from "react-router"

export default function Folders(){
    // redirect to my-drive page
    const navigate = useNavigate()
    useEffect(()=>{
        navigate("/dashboard/my-drive")
    },[navigate])
    return <div>Folders</div>
}