import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import type { Address, AddressInput } from "@/lib/queries";

const schema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  full_address: z.string().trim().min(5, "Please enter the full address.").max(300),
  city: z.string().trim().min(2, "Please enter a city.").max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be exactly 6 digits."),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits."),
});

type Errors = Partial<Record<keyof AddressInput, string>>;

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

export function AddressForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: Address;
  submitting: boolean;
  onSubmit: (values: AddressInput) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<AddressInput>({
    label: initial?.label ?? "Home",
    full_address: initial?.full_address ?? "",
    city: initial?.city ?? "",
    pincode: initial?.pincode ?? "",
    phone: initial?.phone ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function update(key: keyof AddressInput, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof AddressInput] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-card p-6 shadow-soft"
    >
      <h2 className="font-display text-lg font-semibold">
        {initial ? "Edit address" : "Add a new address"}
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="label" className="text-sm font-medium">
            Label
          </label>
          <select
            id="label"
            value={values.label}
            onChange={(e) => update("label", e.target.value)}
            className={inputClass}
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input
            id="city"
            value={values.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
            placeholder="Mumbai"
          />
          {errors.city ? <FieldError>{errors.city}</FieldError> : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="full_address" className="text-sm font-medium">
            Full address
          </label>
          <textarea
            id="full_address"
            rows={3}
            value={values.full_address}
            onChange={(e) => update("full_address", e.target.value)}
            className={inputClass}
            placeholder="Flat 402, Sunrise Apartments, MG Road"
          />
          {errors.full_address ? <FieldError>{errors.full_address}</FieldError> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pincode" className="text-sm font-medium">
            Pincode
          </label>
          <input
            id="pincode"
            inputMode="numeric"
            maxLength={6}
            value={values.pincode}
            onChange={(e) => update("pincode", e.target.value)}
            className={inputClass}
            placeholder="400001"
          />
          {errors.pincode ? <FieldError>{errors.pincode}</FieldError> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            inputMode="numeric"
            maxLength={10}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="9876543210"
          />
          {errors.phone ? <FieldError>{errors.phone}</FieldError> : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {initial ? "Save changes" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {children}
    </p>
  );
}
