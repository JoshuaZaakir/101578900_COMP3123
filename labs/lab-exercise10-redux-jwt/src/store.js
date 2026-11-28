import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export async function api(path, { token, ...options } = {}) {
  const response = await fetch(`/api${path}`, { ...options, headers: {
    'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers,
  } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
  return data;
}

export const login = createAsyncThunk('auth/login', credentials => api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }));
export const loadTasks = createAsyncThunk('tasks/load', async (_, { getState }) => api('/tasks', { token: getState().auth.token }));

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, status: 'signed-out', error: null, notice: null },
  reducers: {
    logout: (state, action) => {
      state.user = null; state.token = null; state.status = 'signed-out'; state.error = null;
      state.notice = action.payload || 'Signed out. The in-memory token was cleared.';
    },
  },
  extraReducers: builder => builder
    .addCase(login.pending, state => { state.status = 'loading'; state.error = null; state.notice = null; })
    .addCase(login.fulfilled, (state, action) => { state.status = 'signed-in'; state.token = action.payload.token; state.user = action.payload.user; })
    .addCase(login.rejected, (state, action) => { state.status = 'signed-out'; state.error = action.error.message; }),
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], filter: 'all', status: 'idle', error: null },
  reducers: {
    // Redux Toolkit uses Immer: draft updates become immutable state updates.
    added: (state, action) => { state.items.push(action.payload); },
    toggled: (state, action) => { const task = state.items.find(item => item.id === action.payload); if (task) task.completed = !task.completed; },
    removed: (state, action) => { state.items = state.items.filter(item => item.id !== action.payload); },
    filterChanged: (state, action) => { state.filter = action.payload; },
  },
  extraReducers: builder => builder
    .addCase(loadTasks.pending, state => { state.status = 'loading'; state.error = null; })
    .addCase(loadTasks.fulfilled, (state, action) => { state.status = 'ready'; state.items = action.payload.tasks; })
    .addCase(loadTasks.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
    .addCase(authSlice.actions.logout, () => ({ items: [], filter: 'all', status: 'idle', error: null })),
});

// This observer is separate from Redux so the subscription never dispatches
// another action (which would recursively notify itself).
let trace = { count: 0, events: [] };
const listeners = new Set();
export const traceObserver = {
  subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
  getSnapshot: () => trace,
};
const actionLogger = () => next => action => {
  const result = next(action);
  // Log action names only. Login thunk payloads/meta can contain credentials.
  trace = { ...trace, events: [action.type, ...trace.events].slice(0, 7) };
  listeners.forEach(listener => listener());
  return result;
};

export const store = configureStore({
  reducer: { auth: authSlice.reducer, tasks: tasksSlice.reducer },
  middleware: getDefault => getDefault().concat(actionLogger),
  // The lab has its own redacted inspector; avoid credentials in DevTools.
  devTools: false,
});

// Concept 5: an explicit low-level subscription, in addition to useSelector.
store.subscribe(() => { trace = { ...trace, count: trace.count + 1 }; });

export const { logout } = authSlice.actions;
export const { added, toggled, removed, filterChanged } = tasksSlice.actions;
