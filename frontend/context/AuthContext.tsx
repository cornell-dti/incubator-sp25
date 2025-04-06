"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  UserCredential,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { User } from "@/@types";
import { TokenVerificationResponse } from "@/@types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface AuthContextType {
  user: User | null;
  isNewUser: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isNewUser: false,
  loading: true,
  signInWithGoogle: async () => {
    throw new Error("signInWithGoogle function not implemented");
  },
  logout: async () => {
    throw new Error("logout function not implemented");
  },
  getAuthToken: async () => {
    throw new Error("getAuthToken function not implemented");
  },
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const verifyTokenWithBackend = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await getIdToken(firebaseUser);

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify token with backend");
      }

      const responseData: TokenVerificationResponse = await response.json();

      // Set user data and isNewUser flag separately
      setUser(responseData.data || (responseData as unknown as User)); // Fallback in case the API doesn't use the wrapper format yet
      setIsNewUser(responseData.isNewUser || false);

      if (responseData.isNewUser) {
        console.log("New user created");
      }

      return responseData;
    } catch (error) {
      console.error("Error verifying token with backend:", error);
      return null;
    }
  };

  // Get fresh auth token (useful for API calls)
  const getAuthToken = async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      return await getIdToken(currentUser, true);
    } catch (error) {
      console.error("Error getting fresh token:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          await verifyTokenWithBackend(firebaseUser);
        } else {
          setUser(null);
          setIsNewUser(false);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Verification happens in the onAuthStateChanged listener
      return result;
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsNewUser(false);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isNewUser,
        signInWithGoogle,
        logout,
        loading,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
