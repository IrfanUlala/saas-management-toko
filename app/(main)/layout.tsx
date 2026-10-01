import Footer from "@/components/layout/main/footer";
import Header from "@/components/layout/main/header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex-1 flex flex-col justify-between ">
      <div>
        <Header />
        {children}
      </div>
      <Footer />
    </section>
  );
}