import { createSlice } from "@reduxjs/toolkit/react";

interface UserStateI{
    user: UserI | null | object
}

const initialValue: UserStateI = {
    user: {}
}


const userSlice = createSlice({
    name: "user",
    initialState: initialValue,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        }
    }
})

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;