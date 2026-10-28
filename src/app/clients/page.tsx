
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/app-schema";

export default async function ClientsPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const clientRecords = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      notes: clients.notes,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(eq(clients.ownerId, session.user.id))
    .orderBy(desc(clients.createdAt));

  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-10 text-[#272321] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <a
          href="/"
          className="text-sm text-[#914b57] hover:underline"
        >
          ← Back to dashboard
        </a>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#a65d69]">
              YOUR BUSINESS
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Clients
            </h1>
            <p className="mt-2 text-sm text-[#827873]">
              Keep your client details organized in one place.
            </p>
          </div>

          <p className="rounded-full bg-[#f5e8e9] px-4 py-2 text-sm font-medium text-[#914b57]">
            {clientRecords.length}{" "}
            {clientRecords.length === 1 ? "client" : "clients"}
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#eae4df] bg-white">
          {clientRecords.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e8e9] text-2xl text-[#914b57]">
                ♙
              </div>
              <h2 className="mt-5 text-lg font-semibold">
                No clients yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#827873]">
                Your client records will appear here when you start
                adding customers to GlamTrack.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-[#eae4df] bg-[#fcfbf9] text-[#827873]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebe7]">
                  {clientRecords.map((client) => (
                    <tr key={client.id} className="hover:bg-[#fcfbf9]">
                      <td className="px-6 py-4 font-medium">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 text-[#827873]">
                        {client.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-[#827873]">
                        {client.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-[#827873]">
                        {client.createdAt.toLocaleDateString("en-NG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
