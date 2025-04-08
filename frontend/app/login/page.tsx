import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Sign in to your account</h1>
        <GoogleSignInButton />
      </div>
    </div>
  );
}
