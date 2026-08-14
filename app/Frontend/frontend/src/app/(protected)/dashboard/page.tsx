import { Button } from "@/components/ui/button";
import { logout } from "@/hooks/auth/use-logout";
import router from "next/router";

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Button
 onClick={async () => {

  await logout
   .mutateAsync();

  router.push(
   "/login",
  );
 }}
>
 Logout
</Button>
    </div>
  );
}