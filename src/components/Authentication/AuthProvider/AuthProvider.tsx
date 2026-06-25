import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase.init";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword,signOut,type User,type UserCredential } from "firebase/auth";
import useAxiosPublic from "@/uri/useAxiosPublic";

interface AuthContextType {
  person: User | null;
  loading: boolean;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [person, setPerson] = useState<User | null>(null);

  const createUser = (email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email: string, password: string) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    return signOut(auth);
  };

   const axiosPublic = useAxiosPublic();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setPerson(user);

      if (user) {
        // User login ase - idToken niye backend e pathao
        try {
          const idToken = await user.getIdToken();
          console.log("User logged in, sending idToken to backend:", idToken);
          const res = await axiosPublic.post("/api/auth/login", { idToken });
          console.log("Backend login success:", res.data);
        } catch (error : any) {
          console.error("Backend login failed:", error.message);
        }
      } else {
        // User logout hoise - backend cookie clear korte bolo
        try {
          await axiosPublic.post("/api/auth/logout");
          console.log("Backend logout success");
        } catch (error : any) {
          console.error("Backend logout failed:", error.message);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const info: AuthContextType = {
    person,
    createUser,
    signIn,
    loading,
    logOut
  };
  return <AuthContext.Provider value={info}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
