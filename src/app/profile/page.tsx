
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { auth } from "@/lib/db/auth";
import { getBusinessProfile } from "@/lib/db/business-profiles";
import ProfileForm from "@/app/onboarding/profile/profile-form";

export default async function ProfilePage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const profile = await getBusinessProfile(session.user.id);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  return (
    <main className="min-h-screen bg-[#faf7f4] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#a65d69]">
            Account settings
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#332b29]">
            Business profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#827873]">
            Manage your business identity and the branding displayed across
            your workspace.
          </p>
        </div>

        <section className="rounded-2xl border border-[#eee6e0] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#332b29]">
              Brand information
            </h2>
            <p className="mt-1 text-sm text-[#827873]">
              Your changes will update your dashboard branding.
            </p>
          </div>

          <ProfileForm
            mode="edit"
            initialValues={{
              brandName: profile.brandName,
              slogan: profile.slogan,
              websiteTitle: profile.websiteTitle,
              description: profile.description,
            }}
          />
        </section>
      </div>
    </main>
  );
}
