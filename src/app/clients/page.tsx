
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/app-schema";
import ClientForm from "./client-form";
import ClientEditForm from "./client-edit-form";
import ClientDeleteButton from "./client-delete-button";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const searchTerm =
    typeof params.q === "string" ? params.q.trim() : "";

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
    .where(
      and(
        eq(clients.ownerId, session.user.id),
        searchTerm
          ? or(
              ilike(clients.name, `%${searchTerm}%`),
              ilike(clients.email, `%${searchTerm}%`),
              ilike(clients.phone, `%${searchTerm}%`),
            )
          : undefined,
      ),
    )
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

            <form
              action="/clients"
              method="GET"
              className="mt-5 flex max-w-lg flex-wrap gap-2"
            >
              <input
                type="search"
                name="q"
                placeholder="Search by name, email, or phone..."
                defaultValue={searchTerm}
                className="min-w-0 flex-1 rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
              />

              <button
                type="submit"
                className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white hover:bg-[#914b57]"
              >
                Search
              </button>

              {searchTerm && (
                <a
                  href="/clients"
                  className="rounded-xl border border-[#eae4df] px-4 py-3 text-sm font-medium hover:bg-white"
                >
                  Clear
                </a>
              )}
            </form>
          </div>

          <p className="rounded-full bg-[#f5e8e9] px-4 py-2 text-sm font-medium text-[#914b57]">
            {clientRecords.length}{" "}
            {clientRecords.length === 1 ? "client" : "clients"}
            {searchTerm ? " found" : " registered"}
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-[#eae4df] bg-white p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-[#a65d69]">
              NEW CLIENT
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Add a client
            </h2>

            <p className="mt-2 text-sm text-[#827873]">
              Save contact details and notes for a new customer.
            </p>
          </div>

          <ClientForm />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#eae4df] bg-white">
          <div className="border-b border-[#eae4df] px-6 py-5">
            <h2 className="text-lg font-semibold">
              Client directory
            </h2>

            <p className="mt-1 text-sm text-[#827873]">
              View and manage your customer records.
            </p>
          </div>

          {clientRecords.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e8e9] text-2xl text-[#914b57]">
                ♙
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {searchTerm ? "No clients found" : "No clients yet"}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#827873]">
                {searchTerm
                  ? `No clients match "${searchTerm}". Try another name, email, or phone number.`
                  : "Your client records will appear here when you start adding customers to GlamTrack."}
              </p>

              {searchTerm && (
                <a
                  href="/clients"
                  className="mt-5 inline-flex rounded-xl bg-[#a65d69] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#914b57]"
                >
                  Clear search
                </a>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-[#eae4df] bg-[#fcfbf9] text-[#827873]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Actions</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">Added</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0ebe7]">
                  {clientRecords.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-[#fcfbf9]"
                    >
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap items-start gap-2">
                          <ClientEditForm client={client} />

                          <ClientDeleteButton
                            clientId={client.id}
                            clientName={client.name}
                          />
                        </div>
                      </td>

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
                        {client.createdAt.toLocaleDateString("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "Africa/Lagos",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="py-8 text-center text-xs text-[#a39a94]">
          GlamTrack · Built for your beauty business
        </footer>
      </div>
    </main>
  );
}
