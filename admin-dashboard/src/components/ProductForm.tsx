import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import toast from "react-hot-toast";

// 1. Create validation rules (Schema) using Zod
const productSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Product name must be at least 3 characters long." }),
  price: z
    .number({ message: "Price is required." })
    .min(0.01, { message: "Price must be greater than 0." }),
  category: z.string().min(2, { message: "Category is required." }),
});

// Generate Type for TypeScript
type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onClose: () => void;
}

export default function ProductForm({ onClose }: ProductFormProps) {
  // 2. React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema), // Connect with Zod
  });

  // 3. Form submit function
  const onSubmit = async (data: ProductFormValues) => {
    // Usually we call RTK Query Mutation here, adding a dummy delay for now
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 seconds loading

    // Beautiful Toast Notification instead of Alert
    toast.success("Product added successfully!");

    onClose();
  };

  return (
    // Background blur effect (Modal Overlay)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Product Name
            </label>
            <input
              {...register("title")}
              placeholder="e.g. Mechanical Keyboard"
              className={`w-full rounded-lg border p-2.5 text-sm outline-none transition-colors ${errors.title ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-500"}`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Price Field */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Price ($)
            </label>
            <input
              type="number"
              step="any"
              {...register("price", { valueAsNumber: true })}
              placeholder="e.g. 129.99"
              className={`w-full rounded-lg border p-2.5 text-sm outline-none transition-colors ${errors.price ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-500"}`}
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Category
            </label>
            <input
              {...register("category")}
              placeholder="e.g. Electronics"
              className={`w-full rounded-lg border p-2.5 text-sm outline-none transition-colors ${errors.category ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-500"}`}
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting ? "Saving Product..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
