
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createBusinessProfileAction,
  updateBusinessProfileAction,
  type BusinessProfileState,
} from "./actions";

type ProfileFormProps = {
  mode?: "create" | "edit";
  initialValues?: {
    brandName: string;
    slogan: string | null;
    websiteTitle: string | null;
    description: string | null;
  };
};

const initialState: BusinessProfileState = {};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#a65d69] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#914b57] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? "Saving..."
        : mode === "create"
          ? "Create business profile"
          : "Save changes"}
    </button>
  );
}

export default function ProfileForm({
  mode = "create",
  initialValues,
}: ProfileFormProps) {
  const action =
    mode === "create"
      ? createBusinessProfileAction
      : updateBusinessProfileAction;

  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="brandName" className="mb-2 block text-sm font-medium">
          Business / brand name <span className="text-[#a65d69]">*</span>
        </label>
        <input
          id="brandName"
          name="brandName"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={initialValues?.brandName ?? ""}
          autoComplete="organization"
          placeholder="e.g. Adorned By Ella"
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
        />
      </div>

      <div>
        <label htmlFor="slogan" className="mb-2 block text-sm font-medium">
          Business slogan <span className="font-normal text-[#827873]">(optional)</span>
        </label>
        <input
          id="slogan"
          name="slogan"
          type="text"
          maxLength={160}
          defaultValue={initialValues?.slogan ?? ""}
          placeholder="e.g. Beauty that makes you feel confident"
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
        />
      </div>

      <div>
        <label htmlFor="websiteTitle" className="mb-2 block text-sm font-medium">
          Website title <span className="text-[#a65d69]">(optional)</span>
        </label>
        <input
          id="websiteTitle"
          name="websiteTitle"
          type="text"
          minLength={2}
          maxLength={100}
          defaultValue={initialValues?.websiteTitle ?? ""}
          placeholder="e.g. Adorned By Ella | Beauty Studio"
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
        />
        <p className="mt-2 text-xs text-[#827873]">
          This appears as your dashboard title in the browser tab.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Business description <span className="font-normal text-[#827873]">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          defaultValue={initialValues?.description ?? ""}
          placeholder="Tell us a little about your beauty business..."
          className="w-full resize-y rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state.success && (
        <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Business profile updated successfully.
        </p>
      )}

      <div className="border-t border-[#eae4df] pt-5">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
