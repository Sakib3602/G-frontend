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
  role: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<string | null>(null);
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
          
        const res = await axiosPublic.post("/api/auth/login", { idToken });
         setRole(res.data.user.role);
          
        } catch (error : any) {
          console.error("Backend login failed:", error.message);
        }
      } else {
        // User logout hoise - backend cookie clear korte bolo
        try {
          await axiosPublic.post("/api/auth/logout");
          
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
    logOut,
    role,
  };
  return <AuthContext.Provider value={info}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
