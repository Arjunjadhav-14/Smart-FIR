import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "firebase/storage";

// ----------------------------------------------------
// DUAL-MODE FIREBASE DETECTION
// ----------------------------------------------------
let firebaseApp = null;
let realAuth = null;
let realDb = null;
let realStorage = null;
let isFirebaseActive = false;

// Try loading configuration from environment or LocalStorage
const savedConfig = localStorage.getItem("firebaseConfig");
let firebaseConfig = null;

if (savedConfig) {
  try {
    firebaseConfig = JSON.parse(savedConfig);
  } catch (e) {
    console.error("Invalid Firebase Config in LocalStorage", e);
  }
}

// Fallback to Env variables if LocalStorage is empty
if (!firebaseConfig && import.meta.env.VITE_FIREBASE_API_KEY) {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
}

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }
    realAuth = getAuth(firebaseApp);
    realDb = getFirestore(firebaseApp);
    realStorage = getStorage(firebaseApp);
    isFirebaseActive = true;
    console.log("🔥 Firebase initialized successfully in LIVE mode.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
  }
} else {
  console.log("📦 Running in LOCAL_STORAGE mode (No Firebase credentials detected). Data will persist locally.");
}

// ----------------------------------------------------
// LOCAL STORAGE MOCK IMPLEMENTATION
// ----------------------------------------------------
const mockDelay = (ms = 500) => new Promise(res => setTimeout(res, ms));

const getLocalCollection = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocalCollection = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock Auth State
let mockCurrentUser = null;
const mockAuthCallbacks = [];

const triggerMockAuthChange = (user) => {
  mockCurrentUser = user;
  mockAuthCallbacks.forEach(cb => cb(user));
};

// ----------------------------------------------------
// AUTH SERVICE (Unified)
// ----------------------------------------------------
export const authService = {
  isFirebaseActive: () => isFirebaseActive,

  signUp: async (email, password, displayName) => {
    if (isFirebaseActive) {
      const userCredential = await createUserWithEmailAndPassword(realAuth, email, password);
      // Save display name & default profile structure in Firestore
      await dbService.saveUser(userCredential.user.uid, {
        name: displayName || email.split("@")[0],
        phone: "",
        city: "",
        language: "en"
      });
      return userCredential.user;
    } else {
      await mockDelay();
      const users = getLocalCollection("mock_users");
      if (users.find(u => u.email === email)) {
        throw new Error("Email already registered in local storage!");
      }
      const newUser = {
        uid: "local_" + Math.random().toString(36).substr(2, 9),
        email,
        displayName: displayName || email.split("@")[0],
        isAnonymous: false
      };
      users.push(newUser);
      setLocalCollection("mock_users", users);
      
      // Save user profile details
      const profiles = getLocalCollection("mock_user_profiles");
      profiles.push({
        userId: newUser.uid,
        name: newUser.displayName,
        phone: "",
        city: "",
        language: "en"
      });
      setLocalCollection("mock_user_profiles", profiles);

      triggerMockAuthChange(newUser);
      return newUser;
    }
  },

  login: async (email, password) => {
    if (isFirebaseActive) {
      const userCredential = await signInWithEmailAndPassword(realAuth, email, password);
      return userCredential.user;
    } else {
      await mockDelay();
      const users = getLocalCollection("mock_users");
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error("User not found in local storage! Please sign up.");
      }
      triggerMockAuthChange(user);
      return user;
    }
  },

  loginAsGuest: async () => {
    await mockDelay(200);
    const guestUser = {
      uid: "guest_" + Math.random().toString(36).substr(2, 9),
      email: "guest@smartfir.gov.in",
      displayName: "Guest Citizen",
      isAnonymous: true
    };
    if (isFirebaseActive) {
      // In Firebase we can sign in anonymously
      // But we can also simulate it nicely, keeping guest session ephemeral.
      console.log("Guest session initiated in Firebase environment.");
    }
    triggerMockAuthChange(guestUser);
    return guestUser;
  },

  logout: async () => {
    if (isFirebaseActive) {
      await signOut(realAuth);
    } else {
      await mockDelay(200);
      triggerMockAuthChange(null);
    }
  },

  onAuthChange: (callback) => {
    if (isFirebaseActive) {
      return onAuthStateChanged(realAuth, callback);
    } else {
      mockAuthCallbacks.push(callback);
      // Immediately call with current value
      callback(mockCurrentUser);
      return () => {
        const index = mockAuthCallbacks.indexOf(callback);
        if (index > -1) mockAuthCallbacks.splice(index, 1);
      };
    }
  },

  getCurrentUser: () => {
    return isFirebaseActive ? realAuth.currentUser : mockCurrentUser;
  }
};

// ----------------------------------------------------
// DATABASE SERVICE (Unified Firestore / LocalStorage)
// ----------------------------------------------------
export const dbService = {
  // User Profile methods
  saveUser: async (userId, userData) => {
    if (isFirebaseActive) {
      await setDoc(doc(realDb, "users", userId), userData, { merge: true });
    } else {
      await mockDelay(100);
      const profiles = getLocalCollection("mock_user_profiles");
      const idx = profiles.findIndex(p => p.userId === userId);
      const profile = { userId, ...userData };
      if (idx > -1) {
        profiles[idx] = { ...profiles[idx], ...userData };
      } else {
        profiles.push(profile);
      }
      setLocalCollection("mock_user_profiles", profiles);
    }
  },

  getUser: async (userId) => {
    if (isFirebaseActive) {
      const snap = await getDoc(doc(realDb, "users", userId));
      return snap.exists() ? snap.data() : null;
    } else {
      await mockDelay(100);
      const profiles = getLocalCollection("mock_user_profiles");
      return profiles.find(p => p.userId === userId) || null;
    }
  },

  // FIR Reports methods
  saveFIRReport: async (reportId, reportData) => {
    if (isFirebaseActive) {
      await setDoc(doc(realDb, "fir_reports", reportId), {
        ...reportData,
        createdAt: serverTimestamp()
      }, { merge: true });
    } else {
      await mockDelay(200);
      const reports = getLocalCollection("mock_fir_reports");
      const idx = reports.findIndex(r => r.reportId === reportId);
      const newReport = { reportId, ...reportData, createdAt: new Date().toISOString() };
      if (idx > -1) {
        reports[idx] = { ...reports[idx], ...reportData };
      } else {
        reports.push(newReport);
      }
      setLocalCollection("mock_fir_reports", reports);
    }
  },

  getUserFIRReports: async (userId) => {
    if (isFirebaseActive) {
      const q = query(collection(realDb, "fir_reports"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const reports = [];
      snap.forEach(d => {
        reports.push({ reportId: d.id, ...d.data() });
      });
      return reports;
    } else {
      await mockDelay(200);
      const reports = getLocalCollection("mock_fir_reports");
      return reports.filter(r => r.userId === userId);
    }
  },

  // Chat Sessions methods
  saveChatSession: async (sessionId, userId, messages) => {
    if (isFirebaseActive) {
      await setDoc(doc(realDb, "chat_sessions", sessionId), {
        userId,
        messages,
        createdAt: serverTimestamp()
      }, { merge: true });
    } else {
      const sessions = getLocalCollection("mock_chat_sessions");
      const idx = sessions.findIndex(s => s.sessionId === sessionId);
      const session = { sessionId, userId, messages, createdAt: new Date().toISOString() };
      if (idx > -1) {
        sessions[idx] = session;
      } else {
        sessions.push(session);
      }
      setLocalCollection("mock_chat_sessions", sessions);
    }
  },

  getUserChatSessions: async (userId) => {
    if (isFirebaseActive) {
      const q = query(collection(realDb, "chat_sessions"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const sessions = [];
      snap.forEach(d => {
        sessions.push({ sessionId: d.id, ...d.data() });
      });
      return sessions;
    } else {
      await mockDelay(100);
      const sessions = getLocalCollection("mock_chat_sessions");
      return sessions.filter(s => s.userId === userId);
    }
  }
};

// ----------------------------------------------------
// STORAGE SERVICE (Unified Firebase Storage / Base64 Fallback)
// ----------------------------------------------------
export const storageService = {
  uploadEvidence: (userId, file, onProgress, onComplete, onError) => {
    if (isFirebaseActive) {
      const storageRef = ref(realStorage, `users/${userId}/evidence/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        },
        (error) => {
          console.error("Storage upload error:", error);
          onError(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          onComplete(downloadUrl);
        }
      );
      return () => uploadTask.cancel();
    } else {
      // Mock File Upload (Convert to base64, save in local simulation indices)
      let progress = 10;
      onProgress(progress);

      const interval = setInterval(() => {
        progress += 30;
        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);

          const reader = new FileReader();
          reader.onloadend = () => {
            // Simulated local file system URL
            const simulatedUrl = reader.result;
            // Since localStorage has limits (5MB), for large files we just return a local blob url
            const blobUrl = URL.createObjectURL(file);
            onComplete(blobUrl);
          };
          reader.readAsDataURL(file);
        } else {
          onProgress(progress);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }
};
