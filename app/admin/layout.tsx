import Footer from "@/components/layout/admin/footer";
import Header from "@/components/layout/admin/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex-1 flex flex-col justify-between relative">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </section>
  );
}