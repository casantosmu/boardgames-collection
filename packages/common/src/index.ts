export const regexp = {
  password: {
    pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
    description:
      "Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.",
  },
  email: {
    pattern:
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    description:
      "Email address must adhere to a valid email format, following the standard specifications. It allows alphanumeric characters, dots, and hyphens in the domain, and requires the presence of an '@' symbol.",
  },
};

export const errorCodes = {
  badRequest: "BAD_REQUEST",
  unauthorized: "UNAUTHORIZED",
  notFound: "NOT_FOUND",
  conflict: "CONFLICT",
  internalServerError: "INTERNAL_SERVER_ERROR",
  validation: "VALIDATION",
  invalidEmail: "INVALID_EMAIL",
  invalidPassword: "INVALID_PASSWORD",
  emailExists: "EMAIL_EXITS",
  routeNotFound: "ROUTE_NOT_FOUND",
};
