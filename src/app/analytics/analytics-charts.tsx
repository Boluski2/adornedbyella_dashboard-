"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueItem = {
  month: string;
  label: string;
  revenue: number;
};

type BookingItem = {
  month: string;
  label: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
};

type ClientInsights = {
  totalClients: number;
  returningClients: number;
  newClients: {
    month: string;
    label: string;
    total: number;
  }[];
};

type AnalyticsChartsProps = {
  revenue: RevenueItem[];
  bookingStats: BookingItem[];
  clientInsights: ClientInsights;
};

const panelClassName =
  "rounded-2xl border border-[#eae4df] bg-white p-5 shadow-sm shadow-[#35251e]/[0.03] sm:p-6";

const tooltipStyle = {
  border: "1px solid #eae4df",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(39, 35, 33, 0.08)",
  fontSize: "12px",
};

function formatNaira(valueInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(valueInKobo / 100);
}

function PanelHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a65d69]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-base font-semibold tracking-tight text-[#272321]">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-5 text-[#827873]">{description}</p>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-[#eae4df] bg-[#fcfbf9] px-6 text-center">
      <div>
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5e8e9] text-lg text-[#a65d69]">
          ···
        </span>
        <p className="mt-3 text-sm font-medium text-[#514a46]">
          Not enough activity yet
        </p>
        <p className="mt-1 text-xs leading-5 text-[#a39a94]">{message}</p>
      </div>
    </div>
  );
}

export default function AnalyticsCharts({
  revenue,
  bookingStats,
  clientInsights,
}: AnalyticsChartsProps) {
  const hasRevenue = revenue.some((item) => item.revenue > 0);
  const hasBookings = bookingStats.some((item) => item.total > 0);
  const hasNewClients = clientInsights.newClients.some(
    (item) => item.total > 0,
  );
  const returningRate = clientInsights.totalClients
    ? Math.round(
        (clientInsights.returningClients / clientInsights.totalClients) * 100,
      )
    : 0;

  return (
    <div className="mt-6 space-y-6">
      <section className={panelClassName}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PanelHeading
            eyebrow="Revenue"
            title="Revenue over time"
            description="Monthly revenue from completed appointments."
          />
          <span className="rounded-full bg-[#faf5f1] px-3 py-1.5 text-xs font-medium text-[#827873]">
            Nigerian naira
          </span>
        </div>

        <div className="mt-6 h-72 w-full sm:h-80">
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenue}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="analyticsRevenueFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#a65d69" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a65d69" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#f0ebe7"
                  strokeDasharray="3 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#a39a94" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tickMargin={12}
                />
                <YAxis
                  tickFormatter={(value) =>
                    `₦${Number(value / 100).toLocaleString("en-NG")}`
                  }
                  tick={{ fontSize: 11, fill: "#a39a94" }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatNaira(Number(value)), "Revenue"]}
                  labelStyle={{ color: "#514a46", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a65d69"
                  strokeWidth={2.5}
                  fill="url(#analyticsRevenueFill)"
                  activeDot={{ r: 5, fill: "#a65d69", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Completed appointment revenue will appear here." />
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={panelClassName}>
          <PanelHeading
            eyebrow="Appointments"
            title="Booking activity"
            description="Total appointments compared with completed work."
          />

          <div className="mt-6 h-72 w-full">
            {hasBookings ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingStats}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  barGap={5}
                >
                  <CartesianGrid
                    stroke="#f0ebe7"
                    strokeDasharray="3 5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#a39a94" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={22}
                    tickMargin={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#a39a94" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#514a46", fontWeight: 600 }}
                    formatter={(value, name) => [
                      Number(value).toLocaleString("en-NG"),
                      name,
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={32}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: "11px", color: "#827873" }}
                  />
                  <Bar
                    dataKey="total"
                    name="All bookings"
                    fill="#d9b4b8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#789b83"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Booking totals will appear here as appointments are recorded." />
            )}
          </div>
        </section>

        <section className={`${panelClassName} xl:col-span-2`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-center">
            <div>
              <PanelHeading
                eyebrow="Audience"
                title="Client growth"
                description="New client registrations by month."
              />
              <div className="mt-5 h-64 w-full">
                {hasNewClients ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientInsights.newClients}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="#f0ebe7"
                        strokeDasharray="3 5"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#a39a94" }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={22}
                        tickMargin={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: "#a39a94" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: "#514a46", fontWeight: 600 }}
                        formatter={(value) => [
                          Number(value).toLocaleString("en-NG"),
                          "New clients",
                        ]}
                      />
                      <Bar
                        dataKey="total"
                        name="New clients"
                        fill="#a65d69"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="New registrations will appear here." />
                )}
              </div>
            </div>

            <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-[#f0ebe7] bg-[#fcfbf9] p-4">
                <p className="text-xs font-medium text-[#827873]">
                  Total clients
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#272321]">
                  {clientInsights.totalClients.toLocaleString("en-NG")}
                </p>
                <p className="mt-1 text-xs text-[#a39a94]">Across your client list</p>
              </div>
              <div className="rounded-xl border border-[#f0ebe7] bg-[#fcfbf9] p-4">
                <p className="text-xs font-medium text-[#827873]">
                  Returning clients
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold tracking-tight text-[#272321]">
                    {clientInsights.returningClients.toLocaleString("en-NG")}
                  </p>
                  <span className="text-xs font-medium text-[#5a8064]">
                    {returningRate}%
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#a39a94]">
                  Clients with 2 or more completed appointments in the last 12 months
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
