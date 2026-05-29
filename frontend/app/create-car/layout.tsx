import Navbar from '@/components/Navbar';

export default function CreateCarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        {children}
      </main>
    </div>
  );
}
