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

export interface UserData {
  id: number;
  email: string;
}
