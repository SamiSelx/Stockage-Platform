import api from "..";

const API_FOLDER = "/folder";

export const apiFolder = api.injectEndpoints({
  endpoints: (build) => ({
    getFolders: build.query<
      ResponseI<{ currentParent: string; folders: FolderI[] }>,
      void
    >({
      query: () => ({
        url: `${API_FOLDER}/`,
        method: "GET",
      }),
      providesTags: ["folder"],
    }),
    createFolder: build.mutation<
      ResponseI<FolderI>,
      { name: string; parentFolder?: string }
    >({
      query: (body) => ({
        url: `${API_FOLDER}/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["folder"],
    }),
    deleteFolder: build.mutation<ResponseI<null>, string>({
      query: (folderId) => ({
        url: `${API_FOLDER}/${folderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["folder"],
    }),
    getFolderById: build.query<ResponseI<FolderI>, string>({
      query: (folderId) => ({
        url: `${API_FOLDER}/${folderId}`,
        method: "GET",
      }),
      providesTags: ["folder"],
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
    })
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
} = apiFolder;
