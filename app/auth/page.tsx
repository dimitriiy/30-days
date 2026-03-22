"use client";

import { useState } from "react";
import { Login } from "@/features/auth/ui/Login";
import { Register } from "@/features/auth/ui/Register";

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
