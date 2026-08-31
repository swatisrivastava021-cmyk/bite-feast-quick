import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — QuickBite" },
      {
        name: "description",
        content: "Sign up for QuickBite to order food, save addresses and track orders.",
      },
      { property: "og:title", content: "Create your account — QuickBite" },
      {
        property: "og:description",
        content: "Sign up free and order from six local restaurants.",
      },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type Errors = Partial<Record<"fullName" | "email" | "password" | "form", string>>;

function SignupPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  function update(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Errors] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName },
      },
    });
    setSubmitting(false);

    if (error) {
      setErrors({
        form: error.message.includes("already registered")
          ? "An account with this email already exists. Try logging in instead."
          : error.message,
      });
      return;
    }

    if (data.session) {
      navigate({ to: "/restaurants" });
      return;
    }
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-border bg-card p-9 shadow-card">
          <h1 className="font-display text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{values.email}</strong>. Click it to activate your
            account, then log in.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-20">
      <div className="rounded-3xl border border-border bg-card p-7 shadow-card sm:p-9">
        <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">It takes less than a minute.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Swati Srivastava"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            {errors.fullName ? <FieldError>{errors.fullName}</FieldError> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            {errors.password ? <FieldError>{errors.password}</FieldError> : null}
          </div>

          {errors.form ? (
            <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errors.form}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {children}
    </p>
  );
}
