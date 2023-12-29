import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Navigate, Link as LinkRouter, useNavigate } from "react-router-dom";
import { errorCodes, regexp } from "common";
import { z } from "zod";
import { useForm } from "../../hooks/form";
import { useAuth } from "../../providers/auth";
import { useRegisterMutation } from "./api";

const FormSchema = z.object({
  email: z.string().regex(regexp.email.pattern),
  password: z.string().regex(regexp.password.pattern),
});

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const auth = useAuth();

  const { inputs, errors, handleSubmit } = useForm({
    values: {
      email: "",
      password: "",
    },
    schema: FormSchema,
  });

  const { status, error, mutate } = useRegisterMutation({
    onSuccess(data) {
      auth.dispatch({
        type: "LOGIN",
        payload: data,
      });
      navigate("/");
    },
  });

  if (auth.state) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(mutate)}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            {...inputs.email}
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            helperText={
              errors.email ? "Please enter a valid email address." : undefined
            }
          />
          <TextField
            {...inputs.password}
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="new-password"
            helperText={
              errors.password ? regexp.password.description : undefined
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={status === "loading"}
          >
            Register
          </Button>
          {error && (
            <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>
              {error.code === errorCodes.emailExists
                ? "Email already exists"
                : "Something unexpected occurred."}
            </Alert>
          )}
          <Link component={LinkRouter} to="/login" variant="body2">
            Already have an account? Sign in
          </Link>
        </Box>
      </Box>
    </Container>
  );
};
