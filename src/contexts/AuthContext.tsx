import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  initials: string;
  color: string;
  title?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    title?: string
  ) => Promise<void>;
  continueWithDemoProfile: (displayName?: string) => void;
  updateUserProfile: (updates: {
    displayName: string;
    title: string;
    color: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isLocalSession: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AVATAR_COLORS = [
  '#5E6AD2',
  '#27C383',
  '#E5A83B',
  '#8B95E5',
  '#EB5757',
  '#0EA5E9',
];

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'TB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pickColorForUid(uid: string): string {
  let sum = 0;
  for (let i = 0; i < uid.length; i++) {
    sum += uid.charCodeAt(i);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLocalSession, setIsLocalSession] = useState(false);

  // Sync Firebase Auth & Firestore /profiles/{uid}
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!firebaseUser) {
        if (!isLocalSession) {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
        return;
      }

      setIsLocalSession(false);
      setUser(firebaseUser);

      const profilePath = `profiles/${firebaseUser.uid}`;
      const profileRef = doc(db, 'profiles', firebaseUser.uid);

      try {
        const snap = await getDoc(profileRef);
        const fallbackName =
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'Team Member';
        const initials = computeInitials(fallbackName);
        const color = pickColorForUid(firebaseUser.uid);

        if (!snap.exists()) {
          // Only write to Firestore if email_verified is true (satisfied by Google OAuth)
          if (firebaseUser.emailVerified) {
            await setDoc(profileRef, {
              uid: firebaseUser.uid,
              displayName: fallbackName.slice(0, 80),
              avatarUrl: firebaseUser.photoURL || '',
              initials,
              color,
              title: 'Workspace Lead',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            if (firebaseUser.email) {
              const privateRef = doc(db, 'users_private', firebaseUser.uid);
              await setDoc(privateRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email.slice(0, 200),
                createdAt: serverTimestamp(),
              });
            }
          } else {
            // Unverified email/password user: provide immediate local profile object
            setProfile({
              uid: firebaseUser.uid,
              displayName: fallbackName,
              initials,
              color,
              title: 'Workspace Lead',
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // If rules block unverified email write, fall back gracefully
        const fallbackName =
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'Team Member';
        setProfile({
          uid: firebaseUser.uid,
          displayName: fallbackName,
          initials: computeInitials(fallbackName),
          color: pickColorForUid(firebaseUser.uid),
          title: 'Workspace Lead',
        });
        setLoading(false);
        return;
      }

      unsubProfile = onSnapshot(
        profileRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              uid: data.uid,
              displayName: data.displayName,
              avatarUrl: data.avatarUrl,
              initials: data.initials,
              color: data.color,
              title: data.title || 'Workspace Lead',
            });
          }
          setLoading(false);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, profilePath);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, [isLocalSession]);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(
        err?.message || 'Google sign-in could not be completed. Please try again.'
      );
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/configuration-not-found'
      ) {
        // Automatically authenticate into an interactive session if Email/Password provider isn't toggled in Firebase Console yet
        const nameFromEmail = email.split('@')[0] || 'Alex Rivera';
        continueWithDemoProfile(nameFromEmail);
        return;
      }
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Please check your credentials.');
      } else {
        setAuthError(err?.message || 'Unable to sign in with email and password.');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    title = 'Project Lead'
  ) => {
    setAuthError(null);
    const cleanName = displayName.trim().slice(0, 80) || 'Team Member';
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        pass
      );
      await updateProfile(cred.user, { displayName: cleanName });
      setProfile({
        uid: cred.user.uid,
        displayName: cleanName,
        initials: computeInitials(cleanName),
        color: pickColorForUid(cred.user.uid),
        title,
      });
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/configuration-not-found'
      ) {
        continueWithDemoProfile(cleanName, title);
        return;
      }
      setAuthError(err?.message || 'Could not create account.');
      throw err;
    }
  };

  const continueWithDemoProfile = (
    displayName = 'Elena Rostova',
    title = 'Creative & Operations Lead'
  ) => {
    setAuthError(null);
    const cleanName = displayName.trim() || 'Elena Rostova';
    const uid = 'usr-demo-elena';
    setIsLocalSession(true);
    setProfile({
      uid,
      displayName: cleanName,
      initials: computeInitials(cleanName),
      color: '#5E6AD2',
      title,
    });
    setLoading(false);
  };

  const updateUserProfile = async (updates: {
    displayName: string;
    title: string;
    color: string;
  }) => {
    if (!profile) return;
    const cleanName = updates.displayName.trim().slice(0, 80);
    const cleanTitle = updates.title.trim().slice(0, 80);
    const initials = computeInitials(cleanName);

    if (user && user.emailVerified && !isLocalSession) {
      const profilePath = `profiles/${user.uid}`;
      try {
        await updateDoc(doc(db, 'profiles', user.uid), {
          displayName: cleanName,
          title: cleanTitle,
          color: updates.color,
          initials,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, profilePath);
      }
    } else {
      setProfile({
        ...profile,
        displayName: cleanName,
        title: cleanTitle,
        color: updates.color,
        initials,
      });
    }
  };

  const logout = async () => {
    setIsLocalSession(false);
    setProfile(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        continueWithDemoProfile,
        updateUserProfile,
        logout,
        isLocalSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
