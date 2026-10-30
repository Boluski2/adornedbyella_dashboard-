
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import ProfileForm from "./profile-form";
import { auth } from "@/lib/db/auth";
import { getBusinessProfile } from "@/lib/db/business-profiles";

export default async function ProfileOnboardingPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const profile = await getBusinessProfile(session.user.id);

  if (profile) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f4] px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a65d69] text-2xl font-semibold text-white">
            G
          </div>

          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#a65d69]">
            Welcome
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#332b29]">
            Set up your business profile
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#827873]">
            Let's personalise your workspace. Add your business details so
            your dashboard reflects your brand.
          </p>
        </div>

        <div className="rounded-2xl border border-[#eee6e0] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#332b29]">
              Business information
            </h2>
            <p className="mt-1 text-sm text-[#827873]">
              You can update these details later in your profile settings.
            </p>
          </div>

          <ProfileForm />
        </div>

        <p className="mt-6 text-center text-xs text-[#a49a94]">
          Your business information is private to your account.
        </p>
      </div>
    </main>
  );
}
