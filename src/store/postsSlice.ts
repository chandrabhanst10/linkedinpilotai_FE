import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';
import { getApiErrorMessage } from '../utils/errors';
import type { Post, PostPayload, FetchPostsParams } from '../types/posts';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

export const fetchPostsThunk = createAsyncThunk<Post[], FetchPostsParams | void, { rejectValue: string }>(
  'posts/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API.get('/posts', { params });
      if (response.data.success) {
        return response.data.data as Post[];
      }
      return rejectWithValue('Failed to retrieve posts.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve posts.'));
    }
  }
);

export const fetchPostByIdThunk = createAsyncThunk<Post, string, { rejectValue: string }>(
  'posts/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/posts/${id}`);
      if (response.data.success) {
        return response.data.data as Post;
      }
      return rejectWithValue('Failed to retrieve post details.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retrieve post details.'));
    }
  }
);

export const createPostThunk = createAsyncThunk<Post, PostPayload, { rejectValue: string }>(
  'posts/createPost',
  async (postPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.post('/posts', postPayload);
      if (response.data.success) {
        dispatch(fetchPostsThunk({}));
        return response.data.data as Post;
      }
      return rejectWithValue('Failed to create post.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create post.'));
    }
  }
);

export const updatePostThunk = createAsyncThunk<
  Post,
  { id: string; postPayload: PostPayload },
  { rejectValue: string }
>(
  'posts/updatePost',
  async ({ id, postPayload }, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.put(`/posts/${id}`, postPayload);
      if (response.data.success) {
        dispatch(fetchPostsThunk({}));
        return response.data.data as Post;
      }
      return rejectWithValue('Failed to update post.');
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update post.'));
    }
  }
);

export const deletePostThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'posts/deletePost',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await API.delete(`/posts/${id}`);
      dispatch(fetchPostsThunk({}));
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete post.'));
    }
  }
);

export const duplicatePostThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'posts/duplicatePost',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await API.post(`/posts/${id}/duplicate`);
      dispatch(fetchPostsThunk({}));
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to duplicate post.'));
    }
  }
);

export const retryPostThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'posts/retryPost',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await API.post(`/posts/${id}/retry`);
      dispatch(fetchPostsThunk({}));
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to retry post execution.'));
    }
  }
);

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsThunk.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPostsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(fetchPostByIdThunk.pending, (state) => {
        state.loading = true;
        state.currentPost = null;
        state.error = null;
      })
      .addCase(fetchPostByIdThunk.fulfilled, (state, action) => {
        state.currentPost = action.payload;
        state.loading = false;
      })
      .addCase(fetchPostByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(createPostThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createPostThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createPostThunk.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(updatePostThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updatePostThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updatePostThunk.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;
