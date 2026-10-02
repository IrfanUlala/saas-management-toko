import Footer from "@/components/layout/admin/footer";
import Header from "@/components/layout/admin/header";
import Navigation from "@/components/layout/admin/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex min-h-dvh flex-1 flex-col justify-between">
      <Header />
      <main className="flex-1 pb-4">
        {children}
      </main>
      <Footer />
      <Navigation />
    </section>
  );
}