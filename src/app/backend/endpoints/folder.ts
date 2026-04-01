import api from ".."

const API_FOLDER = '/folder'

export const apiFolder = api.injectEndpoints({
    endpoints: (build) => ({
        getFolders: build.query<ResponseI<{currentParent:string, folders: FolderI[]}>, string | undefined>({
            query: (parentFolder?:string) => ({
                url: `${API_FOLDER}?parentFolder=${parentFolder}`,
                method: "GET",
            }),
            providesTags: ["folder","file"]
        }),
        createFolder: build.mutation<ResponseI<FolderI>, { name: string; parentFolder?: string }>({
            query: (body) => ({
                url: `${API_FOLDER}/`,
                method: "POST",
                body
            }),
            invalidatesTags: ["folder"]
        }),
        deleteFolder: build.mutation<ResponseI<null>, string>({
            query: (folderId) => ({
                url: `${API_FOLDER}/${folderId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["folder"]
        }),
        getFolderById: build.query<ResponseI<FolderI>, string>({
            query: (folderId) => ({
                url: `${API_FOLDER}/${folderId}`,
                method: "GET",
            }),
            providesTags: ["folder"]
        }),
    })
})

export const { useGetFoldersQuery, useCreateFolderMutation, useDeleteFolderMutation, useGetFolderByIdQuery } = apiFolder;