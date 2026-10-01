export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Toman</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-primary">Dashboard</a>
          <a href="#" className="hover:text-primary">Stok</a>
          <a href="#" className="hover:text-primary">Laporan</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-gray-600 hover:text-primary">Login</button>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secondary">Daftar</button>
        </div>
      </div>
    </header>
  );
}