import api from "..";

const API_FILE = "/file";

export const apiFile = api.injectEndpoints({
  endpoints: (build) => ({
    getFiles: build.query<ResponseI<{currentFolder:string, files: FileI[], storage: {storageUsed:number, storageLimit:number}}>, string | undefined>({
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
  }),
});


export const { useGetFilesQuery, useUploadFileMutation, useDownloadFileMutation } = apiFile;