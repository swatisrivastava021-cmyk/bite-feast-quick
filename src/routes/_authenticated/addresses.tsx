import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddressForm } from "@/components/AddressForm";
import { EmptyState, ErrorState, Spinner } from "@/components/Feedback";
import { Page, PageHeader } from "@/components/PageHeader";
import {
  useAddresses,
  useDeleteAddress,
  useSaveAddress,
  type Address,
  type AddressInput,
} from "@/lib/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({
    meta: [
      { title: "Delivery addresses — QuickBite" },
      { name: "description", content: "Add, edit and remove your QuickBite delivery addresses." },
      { property: "og:title", content: "Delivery addresses — QuickBite" },
      { property: "og:description", content: "Keep your saved addresses ready for fast checkout." },
    ],
  }),
  component: AddressesPage,
});

function AddressesPage() {
  const { data, isPending, isError, refetch } = useAddresses();
  const save = useSaveAddress();
  const remove = useDeleteAddress();
  const [mode, setMode] = useState<{ type: "none" } | { type: "new" } | { type: "edit"; address: Address }>({
    type: "none",
  });
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null);

  function handleSubmit(values: AddressInput) {
    const id = mode.type === "edit" ? mode.address.id : undefined;
    save.mutate(
      { id, values },
      {
        onSuccess: () => {
          toast.success(id ? "Address updated" : "Address saved");
          setMode({ type: "none" });
        },
        onError: () => toast.error("We couldn't save that address. Please try again."),
      },
    );
  }

  return (
    <Page>
      <PageHeader
        title="Delivery addresses"
        subtitle="Saved addresses make checkout a two-tap job."
        action={
          mode.type === "none" ? (
            <button
              onClick={() => setMode({ type: "new" })}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="size-4" aria-hidden />
              New address
            </button>
          ) : null
        }
      />

      {mode.type !== "none" ? (
        <div className="mb-8">
          <AddressForm
            key={mode.type === "edit" ? mode.address.id : "new"}
            initial={mode.type === "edit" ? mode.address : undefined}
            submitting={save.isPending}
            onSubmit={handleSubmit}
            onCancel={() => setMode({ type: "none" })}
          />
        </div>
      ) : null}

      {isPending ? <Spinner label="Loading your addresses..." /> : null}
      {isError ? <ErrorState message="We couldn't load your addresses." onRetry={refetch} /> : null}

      {data && data.length === 0 && mode.type === "none" ? (
        <EmptyState
          title="No saved addresses yet"
          description="Add your first delivery address so you can check out quickly."
          action={
            <button
              onClick={() => setMode({ type: "new" })}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Add address
            </button>
          }
        />
      ) : null}

      {data && data.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.map((address) => (
            <li key={address.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden />
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {address.label}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium">{address.full_address}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {address.city} — {address.pincode}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Phone: {address.phone}</p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setMode({ type: "edit", address })}
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </button>
                <button
                  onClick={() => setPendingDelete(address)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.label} — ${pendingDelete.full_address}" will be removed permanently.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) return;
                remove.mutate(pendingDelete.id, {
                  onSuccess: () => toast.success("Address deleted"),
                  onError: () => toast.error("We couldn't delete that address."),
                });
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
