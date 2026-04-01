import api from "..";

const API_FILE = "/file";

export const apiFile = api.injectEndpoints({
  endpoints: (build) => ({
    getFiles: build.query<ResponseI<ListeFilesResponse>, string | undefined>({
      query: (folderId?:string) => ({
        url: `${API_FILE}?folderId=${folderId}`,
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
    }),
    getTrashFiles: build.query<ResponseI<GetTrashFilesResponse>, void>({
      query: () => ({
        url: `${API_FILE}/trash`,
        method: "GET",
      }),
    }),
    getStarredFiles: build.query<ResponseI<GetStarredFilesResponse>, void>({
      query: () => ({
        url: `${API_FILE}/starred`,
        method: "GET",
      }),
    }),

    setStarredFiles: build.mutation<
      ResponseI<FileI>,
      { fileId: string; starred: boolean }
    >({
      query: ({ fileId, starred }) => ({
        url: `${API_FILE}/${fileId}/star`,
        method: "PUT",
        body: { starred },
      }),
    }),

    supprimerFichier: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FILE}/${id}`,
        method: "DELETE",
      }),
    }),
    restaurerFichier: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FILE}/restore/${id}`,
        method: "PUT",
      }),
    }),
    supprimerFichierDefinitivement: build.mutation<ResponseI<null>, string>({
      query: (id) => ({
        url: `${API_FILE}/permanent/${id}`,
        method: "DELETE",
      }),
    }),
     getStatistics: build.query<
      ResponseI<StatisticResponse>,
      void
    >({
      query: () => ({
        url: `${API_FILE}/statistics`,
        method: "GET",
      }),
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
} = apiFile;