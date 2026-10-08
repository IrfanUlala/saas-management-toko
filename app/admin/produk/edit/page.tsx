import { Suspense } from "react";
import EditFeature from "@/features/produk/edit";

export default function EditPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">Memuat formulir produk…</div>}>
      <EditFeature />
    </Suspense>
  );
}