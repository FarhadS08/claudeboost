import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-12">{children}</main>
    </>
  );
}
