import {
  Boxes,
  CreditCard,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  UserCheck,
  Wallet,
  Store,
  TrendingUp,
  AlertTriangle,
  Clock3,
} from "lucide-react";

const salesBars = [
  { day: "Sen", value: 46 },
  { day: "Sel", value: 62 },
  { day: "Rab", value: 54 },
  { day: "Kam", value: 78 },
  { day: "Jum", value: 68 },
  { day: "Sab", value: 92 },
  { day: "Min", value: 74 },
];

const transactions = [
  { id: "TRX-2084", customer: "Pelanggan umum", time: "14:32", items: "3 item", amount: "Rp 245.000", status: "Selesai" },
  { id: "TRX-2083", customer: "Dina P.", time: "14:18", items: "5 item", amount: "Rp 182.500", status: "Selesai" },
  { id: "TRX-2082", customer: "Pelanggan umum", time: "13:56", items: "2 item", amount: "Rp 96.000", status: "Selesai" },
  { id: "TRX-2081", customer: "Budi S.", time: "13:41", items: "8 item", amount: "Rp 427.000", status: "Diproses" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 px-4 md:px-6">
      {/* Welcome */}
      <section>
        <div className="flex items-start justify-between gap-4 mt-3">
          <div>
            <p className="text-sm font-medium text-primary">
              Dashboard Toko
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Selamat datang di Toman 👋
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Kelola seluruh operasional toko Anda dari satu tempat.
            </p>
          </div>

          <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-primary/10 sm:flex">
            <Store className="h-5 w-5 text-primary" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard title="Penjualan Hari Ini" value="Rp 4,2 Jt" description="32 transaksi hari ini" icon={Receipt} />
        <SummaryCard title="Stok Menipis" value="12 Produk" description="Dari 148 produk aktif" icon={Package} />
        <SummaryCard title="Pembelian" value="Rp 1,8 Jt" description="5 pesanan minggu ini" icon={Truck} />
        <SummaryCard title="Karyawan Hadir" value="8 Orang" description="Dari 10 karyawan" icon={UserCheck} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">Ringkasan Penjualan</h2>
              <p className="mt-1 text-sm text-gray-500">Performa penjualan selama 7 hari terakhir</p>
            </div>
            <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">7 hari terakhir</span>
          </div>
          <div className="mt-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-gray-900">Rp 28.450.000</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp className="h-3.5 w-3.5" /> 12,8% <span className="font-normal text-gray-400">vs minggu lalu</span></p>
            </div>
            <span className="text-xs text-gray-400">Target: Rp 35.000.000</span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-3 sm:gap-5" aria-label="Grafik penjualan mingguan">
            {salesBars.map((bar) => (
              <div key={bar.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className={`w-full rounded-t-lg ${bar.day === "Sab" ? "bg-primary" : "bg-primary/15"}`} style={{ height: `${bar.value}%` }} title={`${bar.value}%`} />
                </div>
                <span className="text-[11px] text-gray-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Ringkasan Hari Ini</h2>
              <p className="mt-1 text-sm text-gray-500">Aktivitas operasional toko</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Store className="h-5 w-5" /></div>
          </div>
          <div className="mt-5 divide-y divide-gray-100">
            <MetricRow label="Total transaksi" value="32" icon={ShoppingCart} />
            <MetricRow label="Rata-rata transaksi" value="Rp 131.250" icon={CreditCard} />
            <MetricRow label="Produk terjual" value="86 item" icon={Boxes} />
            <MetricRow label="Pengeluaran" value="Rp 850.000" icon={Wallet} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>12 produk perlu restok</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 md:px-6">
          <div>
            <h2 className="font-semibold text-gray-900">Transaksi Terbaru</h2>
            <p className="mt-1 text-sm text-gray-500">Aktivitas penjualan hari ini</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400"><Clock3 className="h-3.5 w-3.5" /> Diperbarui sekarang</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="bg-gray-50/70 text-xs font-medium text-gray-400">
              <tr><th className="px-5 py-3 md:px-6">ID Transaksi</th><th className="px-5 py-3">Pelanggan</th><th className="px-5 py-3">Waktu</th><th className="px-5 py-3">Item</th><th className="px-5 py-3">Total</th><th className="px-5 py-3 md:px-6">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="text-gray-600">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900 md:px-6">{transaction.id}</td><td className="whitespace-nowrap px-5 py-4">{transaction.customer}</td><td className="px-5 py-4">{transaction.time}</td><td className="px-5 py-4">{transaction.items}</td><td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">{transaction.amount}</td>
                  <td className="px-5 py-4 md:px-6"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${transaction.status === "Selesai" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{transaction.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingCart;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500"><Icon className="h-4 w-4" /></div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Receipt;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <p className="text-xs font-medium text-gray-500">
          {title}
        </p>
      </div>

      <p className="mt-4 text-xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}