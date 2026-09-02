import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-dino focus:border-transparent outline-none";
export const labelClass = "block text-sm font-medium text-gray-700 mb-1";
export const selectClass = inputClass;

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-forest">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-forest">{title}</h2>
        </div>
      )}
      <div className={title ? "p-6" : "p-6"}>{children}</div>
    </div>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary: "bg-forest text-cream hover:bg-dino",
    secondary: "bg-white text-forest border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-500 hover:text-forest hover:bg-gray-50",
  };
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready_for_pickup: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: OrderStatus | string }) {
  const style = statusStyles[status as OrderStatus] || "bg-gray-100 text-gray-600";
  return (
    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", style)}>
      {String(status).replace(/_/g, " ")}
    </span>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-dino border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-center text-gray-400 py-8 text-sm">{message}</p>;
}
