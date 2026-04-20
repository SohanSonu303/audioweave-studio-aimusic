import { SignIn } from "@clerk/nextjs";

const appearance = {
  variables: {
    colorBackground: "#ffffff",
    colorInputBackground: "#f5f5f5",
    colorText: "#111111",
    colorTextSecondary: "#555555",
    colorPrimary: "#e8a055",
    borderRadius: "10px",
  },
};

export default function SignInPage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <SignIn appearance={appearance} />
    </div>
  );
}
