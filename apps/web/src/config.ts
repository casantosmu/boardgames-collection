if (typeof import.meta.env["VITE_API_BASE_URL"] !== "string") {
  throw new Error("Must add VITE_API_BASE_URL env variable");
}

if (typeof import.meta.env["VITE_IMAGES_BASE_URL"] !== "string") {
  throw new Error("Must add VITE_IMAGES_BASE_URL env variable");
}

export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"];
export const IMAGES_BASE_URL = import.meta.env["VITE_IMAGES_BASE_URL"];
