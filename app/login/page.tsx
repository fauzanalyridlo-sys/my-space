import LoginForm from "@/app/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            Welcome back
          </h1>

          <p className="mt-2 text-zinc-600">
            Sign in to your My Space.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
