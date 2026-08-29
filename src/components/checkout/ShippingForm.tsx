"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const shippingSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  line1: z.string().min(1, "L'adresse est requise"),
  line2: z.string().optional(),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().min(1, "Le code postal est requis"),
  country: z.string().min(2, "Le pays est requis"),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
}

export default function ShippingForm({ onSubmit }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country: "FR",
    },
  });

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Informations de livraison</h2>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          Nom complet
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="line1" className="mb-1 block text-sm font-medium text-gray-700">
          Adresse
        </label>
        <input
          id="line1"
          type="text"
          {...register("line1")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
        />
        {errors.line1 && (
          <p className="mt-1 text-xs text-red-500">{errors.line1.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="line2" className="mb-1 block text-sm font-medium text-gray-700">
          Complement <span className="text-gray-400">(optionnel)</span>
        </label>
        <input
          id="line2"
          type="text"
          {...register("line2")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
            Ville
          </label>
          <input
            id="city"
            type="text"
            {...register("city")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-gray-700">
            Code postal
          </label>
          <input
            id="postalCode"
            type="text"
            {...register("postalCode")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
          />
          {errors.postalCode && (
            <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">
          Pays
        </label>
        <select
          id="country"
          {...register("country")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
        >
          <option value="FR">France</option>
          <option value="BE">Belgique</option>
          <option value="LU">Luxembourg</option>
          <option value="CH">Suisse</option>
          <option value="DE">Allemagne</option>
          <option value="ES">Espagne</option>
          <option value="IT">Italie</option>
        </select>
        {errors.country && (
          <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>
        )}
      </div>
    </form>
  );
}
