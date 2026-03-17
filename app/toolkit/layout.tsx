import ProtectedRoute from "@/app/components/auth/ProtectedRoute";

export default function ToolkitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
