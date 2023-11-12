import { useState } from "react";
import Button from "@mui/material/Button";

export function App(): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>Count {count}</div>
      <Button
        variant="contained"
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      >
        Count
      </Button>
    </>
  );
}
