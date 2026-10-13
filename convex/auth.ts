import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = params.email;
        if (typeof email !== "string" || email.trim().length === 0) {
          throw new Error("Email wajib diisi.");
        }

        const name = params.name;
        if (
          params.flow === "signUp" &&
          (typeof name !== "string" || name.trim().length < 2)
        ) {
          throw new Error("Nama minimal harus terdiri dari 2 karakter.");
        }

        return {
          email: email.trim().toLowerCase(),
          ...(typeof name === "string" ? { name: name.trim() } : {}),
        };
      },
    }),
  ],
});
