import { Alert, AlertTitle, Snackbar } from "@mui/material";
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

interface ToastOrigin {
  vertical: "top" | "bottom";
  horizontal: "left" | "center" | "right";
}

interface ToastProps {
  severity: "success" | "error";
  title?: string;
  message: string;
  origin?: ToastOrigin;
}

interface ToastContext {
  handleOpenToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContext | null>(null);

export const ToastProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const handleOpenToast = (props: ToastProps): void => {
    setToast(props);
  };

  const handleCloseToast = (): void => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ handleOpenToast }}>
      {toast && (
        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          {...(toast.origin && { anchorOrigin: toast.origin })}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.severity}
            sx={{ width: "100%" }}
          >
            {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
            {toast.message}
          </Alert>
        </Snackbar>
      )}
      {children}
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContext => {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
