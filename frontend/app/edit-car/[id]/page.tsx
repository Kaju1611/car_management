'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CarForm from '@/components/CarForm';
import { carsApi } from '@/services/api';
import { Car } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCar = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await carsApi.getOne(id);
      setCar(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push('/dashboard');
    } finally {
      setIsFetching(false);
    }
  }, [id, router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    fetchCar();
  }, [id, router, fetchCar]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await carsApi.update(id, formData);
      toast.success('Car updated successfully!');
      router.push(`/car/${id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/car/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Car</h1>
          <p className="text-muted-foreground text-sm">Update your car listing details</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card p-6">
        {isFetching ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ) : car ? (
          <CarForm
            car={car}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Save Changes"
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
