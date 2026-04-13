import { createSlice } from "@reduxjs/toolkit";


interface FolderStateI{
    folders: FolderI[] | null
    showCreateFolder: boolean
    viewMode: "grid" | "list"
    searchQuery: string
}

const initialValue: FolderStateI = {
    folders: [],
    showCreateFolder: false,
    viewMode: "grid",
    searchQuery: "",
}


const folderSlice = createSlice({
    name: "folder",
    initialState: initialValue,
    reducers: {
        setFolders: (state, action) => {
            state.folders = action.payload;
        },
        createFolder: (state, action) => {
            state.folders?.push(action.payload);
        },
        setShowCreateFolder: (state, action) => {
            state.showCreateFolder = action.payload;
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        }
    }
})

export const { setFolders, createFolder, setShowCreateFolder, setViewMode, setSearchQuery } = folderSlice.actions;

export default folderSlice.reducer;