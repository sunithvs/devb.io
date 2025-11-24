import { NavItem } from "@/components/nav-item";
import { UserAccountNav } from "@/components/user-account-nav";

export function MainNav() {
  return (
    <nav className="flex h-16 items-center justify-between border px-4">
      <div className="flex space-x-4">
        <NavItem href="/">Home</NavItem>
        <NavItem href="/client">Client</NavItem>
        <NavItem href="/server">Server</NavItem>
        <NavItem href="/protected">Protected</NavItem>
        <NavItem href="/admin">Admin</NavItem>
      </div>
      <UserAccountNav />
    </nav>
  );
}
