export const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Payee", color: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Expediee", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Livree", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Annulee", color: "bg-red-100 text-red-700" },
};
