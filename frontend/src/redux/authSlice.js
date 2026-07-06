import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        selectedUser:null,
    },
    reducers:{
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload;
        },
        updateUserProfilePostLikes:(state,action) => {
            const { postId, userId, type } = action.payload;
            const updatePost = (post) => {
                if (!post || post._id !== postId) return post;
                const likes = Array.isArray(post.likes) ? post.likes : [];
                return {
                    ...post,
                    likes: type === "like"
                        ? [...new Set([...likes, userId])]
                        : likes.filter((id) => id !== userId),
                };
            };

            if (state.userProfile?.posts) {
                state.userProfile.posts = state.userProfile.posts.map(updatePost);
            }
            if (state.user?.posts) {
                state.user.posts = state.user.posts.map(updatePost);
            }
        },
        updateUserProfilePostComments:(state,action) => {
            const { postId, comment } = action.payload;
            const updatePost = (post) => {
                if (!post || post._id !== postId) return post;
                return {
                    ...post,
                    comments: [...(Array.isArray(post.comments) ? post.comments : []), comment],
                };
            };

            if (state.userProfile?.posts) {
                state.userProfile.posts = state.userProfile.posts.map(updatePost);
            }
            if (state.user?.posts) {
                state.user.posts = state.user.posts.map(updatePost);
            }
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        }
    }
});
export const {
    setAuthUser, 
    setSuggestedUsers, 
    setUserProfile,
    updateUserProfilePostLikes,
    updateUserProfilePostComments,
    setSelectedUser,
} = authSlice.actions;
export default authSlice.reducer;
