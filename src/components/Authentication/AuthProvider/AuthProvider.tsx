import { createContext } from "react";

interface AuthContextType {
  person: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);
const AuthProvider = ({ children }: { children: React.ReactNode }) => {


    
  const info: AuthContextType = {
    person: "John Doe",
  };
  return <AuthContext.Provider value={info}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
