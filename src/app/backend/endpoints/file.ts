import api from "..";

const API_FILE = "/file";

export const apiFile = api.injectEndpoints({
  endpoints: (build) => ({
    getFiles: build.query<ResponseI<ListeFilesResponse>, string | undefined>({
      query: (folderId?: string) => ({
        url: folderId
          ? `${API_FILE}?folderId=${encodeURIComponent(folderId)}`
          : `${API_FILE}`,
        method: "GET",
      }),
      providesTags: ["file"],
    }),
    uploadFile: build.mutation<ResponseI<FileI>, FormData>({
      query: (formData) => ({
        url: `${API_FILE}/upload`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["file"],
    }),
    downloadFile: build.mutation<ResponseI<FileDataI>, string>({
      query: (fileId) => ({
        url: `${API_FILE}/download/${fileId}`,
        method: "GET",
      }),
      invalidatesTags: ["file"],
    }),

    getRecentFiles: build.query<ResponseI<GetRecentFilesResponse>, void>({
      query: () => ({
        url: `${API_FILE}/recent`,
        method: "GET",
      }),
      providesTags: ["file"],
    }),
    getTrashFiles: build.query<ResponseI<GetTrashFilesResponse>, void>({
      query: () => ({
        url: `${API_FILE}/trash`,
        method: "GET",
      }),
      providesTags: ["file"],
    }),
    getStarredFiles: build.query<ResponseI<GetStarredFilesResponse>, void>({
      query: () => ({
        url: `${API_FILE}/starred`,
        method: "GET",
      }),
      providesTags: ["file"],
    }),

    setStarredFiles: build.mutation<
      ResponseI<FileI>,
      { fileId: string; starred: boolean }
    >({
      query: ({ fileId, starred }) => ({
        url: `${API_FILE}/${fileId}/star`,
        method: "PATCH",
        body: { id: fileId, starred },
      }),
      invalidatesTags: ["file"],
    }),

    supprimerFichier: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FILE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["file"],
    }),
    restaurerFichier: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FILE}/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["file"],
    }),
    supprimerFichierDefinitivement: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FILE}/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: ["file"],
    }),
    getStatistics: build.query<ResponseI<StatisticResponse>, void>({
      query: () => ({
        url: `${API_FILE}/statistics`,
        method: "GET",
      }),
      providesTags: ["file", "folder"],
    }),
    shareFile: build.mutation<
      ResponseI<FileShareI>,
      { fileId: string; recipientId: string; encryptedFK: string }
    >({
      query: ({ fileId, recipientId, encryptedFK }) => ({
        url: `${API_FILE}/${fileId}/share`,
        method: "POST",
        body: { recipientId, encryptedFK },
      }),
      invalidatesTags: ["file"],
    }),
    getSharedFiles: build.query<ResponseI<FileShareI[]>, void>({
      query: () => ({
        url: `${API_FILE}/shared`,
        method: "GET",
      }),
      providesTags: ["file"],
    }),
  }),
});

export const {
  useGetFilesQuery,
  useUploadFileMutation,
  useDownloadFileMutation,
  useGetRecentFilesQuery,
  useGetTrashFilesQuery,
  useGetStarredFilesQuery,
  useSetStarredFilesMutation,
  useSupprimerFichierMutation,
  useRestaurerFichierMutation,
  useSupprimerFichierDefinitivementMutation,
  useGetStatisticsQuery,
  useGetSharedFilesQuery,
  useShareFileMutation,
} = apiFile;
