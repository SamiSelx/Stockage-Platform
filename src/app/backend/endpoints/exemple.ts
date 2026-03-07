import api from "../index";

const API_EXEMPLE = "api/exemple";

export const apiExemple = api.injectEndpoints({
  endpoints: (build) => ({
    getExemple: build.query({
      query: (id) => ({
        url: `${API_EXEMPLE}/exemplePath/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetExempleQuery } = apiExemple;
