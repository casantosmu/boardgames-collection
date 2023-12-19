import {
  Dispatch,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

interface User {
  id: number;
  email: string;
}

type AuthState = User | null;

type AuthAction =
  | {
      type: "LOGIN";
      payload: User;
    }
  | {
      type: "LOGOUT";
    };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN": {
      return action.payload;
    }
    case "LOGOUT": {
      return null;
    }
  }
};

interface AuthContext {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContext | null>(null);

const createInitialState = (): AuthState => {
  const value = localStorage.getItem("user");
  if (typeof value === "string") {
    return JSON.parse(value) as User;
  }
  return null;
};

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [state, dispatch] = useReducer(authReducer, null, createInitialState);
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state));
  }, [state]);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContext => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
