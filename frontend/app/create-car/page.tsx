'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarForm from '@/components/CarForm';
import { carsApi } from '@/services/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

export default function CreateCarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, [router]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await carsApi.create(formData);
      toast.success('Car listed successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Car</h1>
          <p className="text-muted-foreground text-sm">Fill in the details to list your car</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card p-6">
        <CarForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Listing"
        />
      </div>
    </div>
  );
}
