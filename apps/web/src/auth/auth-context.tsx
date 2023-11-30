import { UserData } from "common";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

type State = UserData | null;

type Action =
  | {
      type: "LOGIN";
      payload: State;
    }
  | {
      type: "LOGOUT";
    };

const reducer = (state: State, action: Action): State => {
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
  dispatch: React.Dispatch<Action>;
}

const Context = createContext<Context | null>(null);

const createInitialState = (): State => {
  const value = localStorage.getItem("user");
  if (typeof value === "string") {
    return JSON.parse(value) as UserData;
  }
  return null;
};

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state));
  }, [state]);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): Context => {
  const context = useContext(Context);
  if (context === null) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
