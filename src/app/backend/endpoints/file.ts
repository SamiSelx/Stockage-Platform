import api from "..";

const API_FILE = "/file";

export const apiFile = api.injectEndpoints({
  endpoints: (build) => ({
    getFiles: build.query<ResponseI<FileI[]>, void>({
      query: () => ({
        url: `${API_FILE}/`,
        method: "GET",
      }),
    }),
    uploadFile: build.mutation<ResponseI<FileI>, FormData>({
      query: (formData) => ({
        url: `${API_FILE}/upload`,
        method: "POST",
        body: formData,
      }),
    }),
    downloadFile: build.mutation<ResponseI<Blob>, string>({
      query: (fileId) => ({
        url: `${API_FILE}/download/${fileId}`,
        method: "GET",
      }),
    }),
  }),
});


export const { useGetFilesQuery, useUploadFileMutation, useDownloadFileMutation } = apiFile;