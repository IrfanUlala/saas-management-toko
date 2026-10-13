"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { ArrowLeft, Save } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CatalogStoreGate } from "@/features/produk/catalog-store-gate";

type ProductRecord = {
  product: {
    _id: Id<"products">;
    sku: string;
    barcode?: string;
    name: string;
    categoryId?: Id<"categories">;
    baseUnitId: Id<"units">;
    purchasePrice: number;
    salePrice: number;
    lowStockThreshold: number;
    shelfLocation?: string;
  };
  stock: number;
};

type Category = {
  _id: Id<"categories">;
  name: string;
  status: "active" | "inactive";
};

type Unit = {
  _id: Id<"units">;
  name: string;
  abbreviation: string;
  status: "active" | "inactive";
};

type FormValue = {
  name: string;
  barcode: string;
  categoryId: Id<"categories"> | "";
  baseUnitId: Id<"units"> | "";
  shelfLocation: string;
};

type NumericInputs = {
  purchasePrice: string;
  salePrice: string;
  stock: string;
};

const emptyValue: FormValue = {
  name: "",
  barcode: "",
  categoryId: "",
  baseUnitId: "",
  shelfLocation: "",
};

const emptyNumbers: NumericInputs = {
  purchasePrice: "0",
  salePrice: "0",
  stock: "0",
};

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductForm({ mode }: { mode: "add" | "edit" }) {
  return (
    <CatalogStoreGate>
      <CatalogProductForm mode={mode} />
    </CatalogStoreGate>
  );
}

function CatalogProductForm({ mode }: { mode: "add" | "edit" }) {
  const params = useSearchParams();
  const productId = params.get("id");
  const { isAuthenticated } = useConvexAuth();
  const products = useQuery(api.products.list, isAuthenticated ? {} : "skip");
  const categories = useQuery(
    api.catalog.listCategories,
    isAuthenticated ? {} : "skip",
  );
  const units = useQuery(api.catalog.listUnits, isAuthenticated ? {} : "skip");

  if (products === undefined || categories === undefined || units === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">
        Memuat katalog...
      </div>
    );
  }

  const product = products.find((item) => item.product._id === productId);
  if (mode === "edit" && !product) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-bold">Produk tidak ditemukan</h1>
        <p className="text-sm text-gray-500">
          Pilih produk aktif dari daftar untuk mengubah datanya.
        </p>
        <Link href="/admin/produk">
          <Button variant="outline">Buka daftar produk</Button>
        </Link>
      </section>
    );
  }

  const highestSku = products.reduce(
    (max, item) =>
      Math.max(max, Number(item.product.sku.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );
  const nextSku = `PRD-${String(highestSku + 1).padStart(4, "0")}`;

  return (
    <ProductEditor
      key={product?.product._id ?? "new"}
      mode={mode}
      product={product}
      categories={categories}
      units={units}
      nextSku={nextSku}
    />
  );
}

function ProductEditor({
  mode,
  product,
  categories,
  units,
  nextSku,
}: {
  mode: "add" | "edit";
  product: ProductRecord | undefined;
  categories: Category[];
  units: Unit[];
  nextSku: string;
}) {
  const router = useRouter();
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const activeCategories = categories.filter(
    (category) => category.status === "active",
  );
  const activeUnits = units.filter((unit) => unit.status === "active");
  const [value, setValue] = useState<FormValue>(() =>
    product
      ? {
          name: product.product.name,
          barcode: product.product.barcode ?? "",
          categoryId: product.product.categoryId ?? "",
          baseUnitId: product.product.baseUnitId,
          shelfLocation: product.product.shelfLocation ?? "",
        }
      : emptyValue,
  );
  const [numericInputs, setNumericInputs] = useState<NumericInputs>(() =>
    product
      ? {
          purchasePrice: String(product.product.purchasePrice),
          salePrice: String(product.product.salePrice),
          stock: String(product.stock),
        }
      : emptyNumbers,
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inactiveCategory = categories.find(
    (category) =>
      category._id === product?.product.categoryId &&
      category.status === "inactive",
  );
  const inactiveUnit = units.find(
    (unit) =>
      unit._id === product?.product.baseUnitId && unit.status === "inactive",
  );
  const selectedCategoryId =
    activeCategories.some((category) => category._id === value.categoryId) ||
    inactiveCategory?._id === value.categoryId
      ? value.categoryId
      : "";
  const selectedUnitId =
    activeUnits.some((unit) => unit._id === value.baseUnitId) ||
    inactiveUnit?._id === value.baseUnitId
      ? value.baseUnitId
      : activeUnits[0]?._id || "";

  function update<K extends keyof FormValue>(key: K, field: FormValue[K]) {
    setValue((current) => ({ ...current, [key]: field }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const purchasePrice = Number(numericInputs.purchasePrice || 0);
    const salePrice = Number(numericInputs.salePrice || 0);
    const stock = Number(numericInputs.stock || 0);
    if (!value.name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!selectedUnitId) {
      setError("Pilih satuan dasar produk.");
      return;
    }
    if (![purchasePrice, salePrice, stock].every(Number.isFinite)) {
      setError("Harga dan stok harus berupa angka yang valid.");
      return;
    }
    if ([purchasePrice, salePrice, stock].some((amount) => amount < 0)) {
      setError("Harga dan stok tidak boleh bernilai negatif.");
      return;
    }

    setIsSubmitting(true);
    try {
      const args = {
        sku: product?.product.sku ?? nextSku,
        barcode: value.barcode.trim() || undefined,
        name: value.name.trim(),
        categoryId: selectedCategoryId || undefined,
        baseUnitId: selectedUnitId,
        purchasePrice,
        salePrice,
        stock,
        lowStockThreshold: product?.product.lowStockThreshold ?? 10,
        shelfLocation: value.shelfLocation.trim() || undefined,
      };
      if (mode === "edit" && product) {
        await updateProduct({ ...args, productId: product.product._id });
      } else {
        await createProduct(args);
      }
      router.push("/admin/produk");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Produk gagal disimpan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6">
      <header>
        <Link
          href="/admin/produk"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Kembali ke produk
        </Link>
        <p className="mt-5 text-sm font-medium text-blue-600">KATALOG TOKO</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {mode === "edit" ? "Edit produk" : "Tambah produk"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Lengkapi informasi produk agar dapat digunakan dalam penjualan dan
          pembelian.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={save}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kode produk" id="product-code">
            <Input
              id="product-code"
              value={product?.product.sku ?? nextSku}
              readOnly
              className="bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Kode dibuat otomatis dan tidak dapat diubah.
            </p>
          </Field>
          <Field label="Nama produk" id="product-name" required>
            <Input
              id="product-name"
              required
              value={value.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Contoh: Kopi bubuk 200 g"
            />
          </Field>
          <Field label="Barcode" id="product-barcode">
            <Input
              id="product-barcode"
              value={value.barcode}
              onChange={(event) => update("barcode", event.target.value)}
              placeholder="Pindai atau ketik barcode"
            />
            <p className="mt-1 text-xs text-gray-500">
              Opsional, tetapi harus unik jika diisi.
            </p>
          </Field>
          <Field label="Kategori" id="product-category">
            <Select
              id="product-category"
              value={selectedCategoryId}
              onChange={(event) =>
                update(
                  "categoryId",
                  event.target.value as Id<"categories"> | "",
                )
              }
              options={[
                { label: "Tanpa kategori", value: "" },
                ...(inactiveCategory
                  ? [
                      {
                        label: `${inactiveCategory.name} (nonaktif)`,
                        value: inactiveCategory._id,
                      },
                    ]
                  : []),
                ...activeCategories.map((category) => ({
                  label: category.name,
                  value: category._id,
                })),
              ]}
            />
            <Link
              href="/admin/produk/kategori"
              className="mt-1.5 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Kelola kategori
            </Link>
          </Field>
          <Field label="Satuan dasar" id="product-unit" required>
            <Select
              id="product-unit"
              required
              value={selectedUnitId}
              onChange={(event) =>
                update("baseUnitId", event.target.value as Id<"units"> | "")
              }
              options={[
                { label: "Pilih satuan", value: "" },
                ...(inactiveUnit
                  ? [
                      {
                        label: `${inactiveUnit.name} (${inactiveUnit.abbreviation}) · nonaktif`,
                        value: inactiveUnit._id,
                      },
                    ]
                  : []),
                ...activeUnits.map((unit) => ({
                  label: `${unit.name} (${unit.abbreviation})`,
                  value: unit._id,
                })),
              ]}
            />
            <Link
              href="/admin/produk/satuan"
              className="mt-1 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Kelola satuan dasar
            </Link>
          </Field>
          <Field label="Lokasi rak" id="product-shelf">
            <Input
              id="product-shelf"
              value={value.shelfLocation}
              onChange={(event) => update("shelfLocation", event.target.value)}
              placeholder="Contoh: A-01"
            />
          </Field>
          <Field label="Harga beli (Rp)" id="purchase-price">
            <NumericInput
              id="purchase-price"
              value={numericInputs.purchasePrice}
              onChange={(next) =>
                setNumericInputs((current) => ({
                  ...current,
                  purchasePrice: next,
                }))
              }
            />
            {Number(numericInputs.purchasePrice) > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {money(Number(numericInputs.purchasePrice))}
              </p>
            )}
          </Field>
          <Field label="Harga jual (Rp)" id="sale-price" required>
            <NumericInput
              id="sale-price"
              value={numericInputs.salePrice}
              required
              onChange={(next) =>
                setNumericInputs((current) => ({ ...current, salePrice: next }))
              }
            />
            {Number(numericInputs.salePrice) > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {money(Number(numericInputs.salePrice))}
              </p>
            )}
          </Field>
          <Field label="Stok awal" id="product-stock">
            <NumericInput
              id="product-stock"
              value={numericInputs.stock}
              onChange={(next) =>
                setNumericInputs((current) => ({ ...current, stock: next }))
              }
            />
          </Field>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
          <Link href="/admin/produk">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            <Save size={16} className="mr-2" />
            {isSubmitting
              ? "Menyimpan..."
              : mode === "edit"
                ? "Simpan perubahan"
                : "Simpan produk"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function NumericInput({
  id,
  value,
  required,
  onChange,
}: {
  id: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      id={id}
      type="number"
      min="0"
      step="1"
      required={required}
      value={value}
      onFocus={(event) => {
        if (event.currentTarget.value === "0") onChange("");
      }}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
