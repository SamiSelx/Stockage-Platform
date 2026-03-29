import { setShowCreateFolder as setShowCreate, setViewMode as setView, setSearchQuery as SetSearch } from "@/app/slices/folder";
import type { RootState } from "@/app/store";
import { useDispatch, useSelector } from "react-redux";

export default function useFolder() {
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

    return {
        folders,
        showCreateFolder,
        setShowCreateFolder,
        viewMode,
        searchQuery,
        setViewMode,
        setSearchQuery
    }
}