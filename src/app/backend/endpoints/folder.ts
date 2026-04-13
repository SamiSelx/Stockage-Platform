import api from "..";

const API_FOLDER = "/folder";

export const apiFolder = api.injectEndpoints({
    endpoints: (build) => ({
        getFolders: build.query<ResponseI<{currentParent:string, folders: FolderI[]}>, string | undefined>({
            query: (parentFolder?:string) => ({
                url: `${API_FOLDER}?parentFolder=${parentFolder}`,
                method: "GET",
            }),
            providesTags: ["folder","file","auth"],
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
            providesTags: ["folder","auth"]
    }),

    supprimerDossier: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FOLDER}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["folder"],
    }),

    restaurerDossier: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FOLDER}/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["folder"],
    }),

    supprimerDossierDefinitivement: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FOLDER}/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: ["folder"],
    }),

    getTrashFolders: build.query<ResponseI<{ folders: FolderI[] }>, void>({
      query: () => ({
        url: `${API_FOLDER}/trash`,
        method: "GET",
        }),
        providesTags: ["folder"],
    }),
    renameFolder: build.mutation<ResponseI<FolderI>, { folderId: string; newName: string }>({
      query: ({ folderId, newName }) => ({
        url: `${API_FOLDER}/${folderId}/rename`,
        method: "PATCH",
        body: { name:newName },
      }),
      invalidatesTags: ["folder"],
    }),

  }),
});

export const {
  useGetFoldersQuery,
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useGetFolderByIdQuery,
  useSupprimerDossierMutation,
  useRestaurerDossierMutation,
  useSupprimerDossierDefinitivementMutation,
  useGetTrashFoldersQuery,
  useRenameFolderMutation
} = apiFolder;
