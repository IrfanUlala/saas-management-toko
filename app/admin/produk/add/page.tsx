import { Suspense } from "react";
import AddFeature from "@/features/produk/add";

export default function AddPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">Memuat formulir produk…</div>}>
      <AddFeature />
    </Suspense>
  );
}