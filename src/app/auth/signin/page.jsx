"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { SignInPage } from "@toolpad/core";
import { Box } from "@mui/material";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParam = useSearchParams();
  const [error, setError] = useState("");

  const handleSignInAttempt = async (provider, formData) => {
    setError("");

    if (provider.id === "credentials") {
      const email = formData.get("email");
      const password = formData.get("password");

      // PERBAIKAN KUNCI:
      // 1. Gunakan `redirect: false` agar kita bisa mengontrol alur setelah login.
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });

      // 2. Cek jika ada `result.error`. Jika tidak ada, maka login berhasil.
      if (result.error) {
        return { error: result.error };
      } else {
        console.log
        window.location.href = searchParam.get('callbackUrl');
      }
    }
  };

  const clientSideProviders = [{ id: "credentials", name: "Credentials" }];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `url(/background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <SignInPage
        signIn={handleSignInAttempt}
        providers={clientSideProviders}
        slotProps={{
          submitButton: {
            color: "primary",
            variant: "contained",
          },
        }}
      />
      {error && (
        <div style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>
          {error}
        </div>
      )}
    </Box>
  );
}

