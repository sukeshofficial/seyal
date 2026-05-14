import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-hidden">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
          Welcome back, {user?.name?.first} {user?.name?.last}!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 italic">
          @{user?.username} • {user?.email}
        </p>
      </div>
    </DashboardLayout>
  );
}
