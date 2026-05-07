import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp appearance={CLERK_APPEARANCE} />
    </AuthShell>
  );
}
