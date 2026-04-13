import { useRenameFolderMutation } from "@/app/backend/endpoints/folder";
import { setShowCreateFolder as setShowCreate, setViewMode as setView, setSearchQuery as SetSearch } from "@/app/slices/folder";
import type { RootState } from "@/app/store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function useFolder() {
    const [renameFolder] = useRenameFolderMutation();
    const { folders, showCreateFolder, viewMode, searchQuery } = useSelector((state: RootState) => state.folder)
    const dispatch = useDispatch()

    function setShowCreateFolder(value: boolean) {
        dispatch(setShowCreate(value))
    }

    function setViewMode(mode: "grid" | "list") {
        dispatch(setView(mode))
    }

    function setSearchQuery(query: string) {
        dispatch(SetSearch(query))
    }

    async function handleRenameFolder(folderId: string, newName: string) {
        renameFolder({ folderId, newName })
            .unwrap()
            .then(() => {
                toast.success("Dossier renommé avec succès");
            })
            .catch((err) => {
                toast.error(err.data.message || "Impossible de renommer le dossier");
            });
    }

    return {
        folders,
        showCreateFolder,
        setShowCreateFolder,
        viewMode,
        searchQuery,
        setViewMode,
        setSearchQuery,
        handleRenameFolder
    }
}