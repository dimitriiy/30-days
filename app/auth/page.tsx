"use client";

import { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";

export const Auth = () => {
  const [needRegister, setRegister] = useState(true);

  const toggle = () => setRegister((p) => !p);

  return (
    <div>
      {needRegister ? <Register toggle={toggle} /> : <Login toggle={toggle} />}
    </div>
  );
};

export default Auth;
