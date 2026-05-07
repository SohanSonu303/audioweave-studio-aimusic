import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn appearance={CLERK_APPEARANCE} />
    </AuthShell>
  );
}
