import Footer from "@/components/layout/main/footer";
import Header from "@/components/layout/main/header";
import { SearchSlide, MobileMenuSlide } from "@/components/layout/main/slides";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex-1 flex flex-col justify-between relative">
      <div>
        <Header />
        <main className="">
          {children}
        </main>
      </div>
      <Footer />
      <SearchSlide />
      <MobileMenuSlide />
    </section>
  );
}