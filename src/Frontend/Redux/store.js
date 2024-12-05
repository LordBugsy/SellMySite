import { configureStore, createSlice } from '@reduxjs/toolkit';

// --- User slice
const initialUserState = {
  user: {
    localUserId: "1",
    localUsername: "JohnDoe",
    displayName: "",
    profilePicture: "",
    balance: 0,
    role: ""
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    loginUser: (state, action) => {
      state.user.localUserId = action.payload.localUserId;
      state.user.localUsername = action.payload.localUsername;
      state.user.displayName = action.payload.displayName;

      state.user.profilePicture = action.payload.profilePicture;
      state.user.balance = action.payload.balance;
      state.user.role = action.payload.role;
    },

    logoutUser: (state) => {
      state.user.localUserId = "";
      state.user.localUsername = "";
      state.user.displayName = "";

      state.user.profilePicture = "";
      state.user.balance = 0;
      state.user.role = "";
    },

    updateBalance: (state, action) => {
      state.user.balance = action.payload.balance;
    },
  },
});

// --- Login / Signup slice
const initialLoginSignupState = {
    isLoginSignupShown: false,
};

const loginSignupState = createSlice({
    name: 'loginSignup',
    initialState: initialLoginSignupState,
    reducers : {
        setLoginSignupShown: (state, action) => {
            state.isLoginSignupShown = action.payload;
        }
    }
})

// --- Contact Form slice
const initialContactFormState = {
    isContactFormShown: false,
};

const contactFormState = createSlice({
    name: 'contactForm',
    initialState: initialContactFormState,
    reducers : {
        setContactFormShown: (state, action) => {
            state.isContactFormShown = action.payload;
        }
    }
});

// --- Report Form slice
const initialReportFormState = {
    isReportFormShown: false,
};

const reportFormState = createSlice({
    name: 'reportForm',
    initialState: initialReportFormState,
    reducers : {
        setReportFormShown: (state, action) => {
            state.isReportFormShown = action.payload;
        }
    }
});

// --- Search slice
const initialSearchState = {
    isSearchQueryShown: false,
};

const searchState = createSlice({
    name: 'search',
    initialState: initialSearchState,
    reducers : {
        setSearchQueryShown: (state, action) => {
            state.isSearchQueryShown = action.payload;
        }
    }
});

// --- Notification slice
const initialNotificationState = {
    isNotificationShown: false,
};

const notificationState = createSlice({
    name: 'notification',
    initialState: initialNotificationState,
    reducers : {
        setNotificationShown: (state, action) => {
            state.isNotificationShown = action.payload;
        }
    }
});

// --- Publish Website slice
const initialPublishWebsiteState = {
    isPublishWebsiteShown: false,
};

const publishWebsiteState = createSlice({
    name: 'publishWebsite',
    initialState: initialPublishWebsiteState,
    reducers : {
        setPublishWebsiteShown: (state, action) => {
            state.isPublishWebsiteShown = action.payload;
        }
    }
});


// Extract actions to use in components
export const { loginUser, logoutUser, updatebalance } = userSlice.actions;
export const { setLoginSignupShown } = loginSignupState.actions;
export const { setContactFormShown } = contactFormState.actions;
export const { setReportFormShown } = reportFormState.actions;
export const { setSearchQueryShown } = searchState.actions;
export const { setNotificationShown } = notificationState.actions;
export const { setPublishWebsiteShown } = publishWebsiteState.actions;


// Create store using configureStore with combined reducers
const store = configureStore({
  reducer: {
    user: userSlice.reducer, // User reducer
    loginSignup: loginSignupState.reducer, // Login / Signup reducer
    contactForm: contactFormState.reducer, // Contact Form reducer
    reportForm: reportFormState.reducer, // Report Form reducer
    search: searchState.reducer, // Search reducer
    notification: notificationState.reducer, // Notification reducer
    publishWebsite: publishWebsiteState.reducer, // Publish Website reducer
  },
});

export default store;