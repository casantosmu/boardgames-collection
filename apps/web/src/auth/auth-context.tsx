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

type State = User | null;

type Action =
  | {
      type: "LOGIN";
      payload: User;
    }
  | {
      type: "LOGOUT";
    };

const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOGIN": {
      return action.payload;
    }
    case "LOGOUT": {
      return null;
    }
  }
};

interface Context {
  state: State;
  dispatch: Dispatch<Action>;
}

const AuthContext = createContext<Context | null>(null);

const createInitialState = (): State => {
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
export const useAuth = (): Context => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
