
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateClient, type CreateClientState } from "./actions";

type ClientEditFormProps = {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
  };
};

const initialState: CreateClientState = {};

function SaveChangesButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#a65d69] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#914b57] disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

export default function ClientEditForm({
  client,
}: ClientEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(
    updateClient.bind(null, client.id),
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      window.location.reload();
    }
  }, [state.success]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg border border-[#eae4df] px-3 py-2 text-sm font-medium text-[#914b57] hover:bg-[#f5e8e9]"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-[#eae4df] bg-[#fcfbf9] p-4 sm:p-5">
      <h3 className="mb-4 font-semibold">Edit client details</h3>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor={`name-${client.id}`} className="mb-1.5 block text-sm font-medium">
            Full name
          </label>
          <input
            id={`name-${client.id}`}
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={client.name}
            className="w-full rounded-lg border border-[#eae4df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`email-${client.id}`} className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id={`email-${client.id}`}
              name="email"
              type="email"
              maxLength={254}
              defaultValue={client.email ?? ""}
              className="w-full rounded-lg border border-[#eae4df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
            />
          </div>

          <div>
            <label htmlFor={`phone-${client.id}`} className="mb-1.5 block text-sm font-medium">
              Phone
            </label>
            <input
              id={`phone-${client.id}`}
              name="phone"
              type="tel"
              maxLength={30}
              defaultValue={client.phone ?? ""}
              className="w-full rounded-lg border border-[#eae4df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`notes-${client.id}`} className="mb-1.5 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id={`notes-${client.id}`}
            name="notes"
            rows={3}
            maxLength={2000}
            defaultValue={client.notes ?? ""}
            className="w-full rounded-lg border border-[#eae4df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <SaveChangesButton />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl border border-[#eae4df] px-4 py-2.5 text-sm font-medium hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
