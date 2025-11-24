import { getUserRole } from "@/lib/get-user-role";
import { createClient } from "@/lib/supabase/server";

export default async function ServerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = await getUserRole();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">User: {user?.email || "N/A"}</h1>
      <h2 className="text-lg font-medium"> Role: {role || "N/A"}</h2>
      <p className="text-muted-foreground">(I am a server component.)</p>
    </div>
  );
}
