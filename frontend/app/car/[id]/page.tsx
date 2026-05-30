'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Car,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { carsApi } from '@/services/api';
import { Car as CarType } from '@/types';
import { toast } from 'sonner';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default function CarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [car, setCar] = useState<CarType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const fetchCar = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await carsApi.getOne(id);
      setCar(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    fetchCar();
  }, [id, router, fetchCar]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await carsApi.delete(id);
      toast.success('Car deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsDeleting(false);
    }
  };

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="w-full aspect-[16/9] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">{car.title}</h1>
            <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Listed {formatDate(car.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/edit-car/${car._id}`} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline ml-1.5">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this car listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{car.title}&rdquo; and all {car.images.length} image{car.images.length !== 1 ? 's' : ''}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Listing
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image carousel + description */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image Carousel */}
          {car.images.length > 0 ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-muted">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {car.images.map((img, i) => (
                      <div key={i} className="relative flex-[0_0_100%] aspect-[16/9]">
                        <Image
                          src={img}
                          alt={`${car.title} - image ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          priority={i === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prev/Next arrows */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={scrollPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image count */}
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs rounded-full px-2.5 py-1">
                  {selectedIndex + 1} / {car.images.length}
                </div>
              </div>

              {/* Thumbnail strip */}
              {car.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {car.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => scrollTo(i)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                        i === selectedIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[16/9] rounded-xl bg-muted flex items-center justify-center">
              <Car className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Description */}
          <div className="border rounded-lg p-5 bg-card">
            <h2 className="font-semibold text-base mb-3">Description</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{car.description}</p>
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          {/* Car Details Card */}
          <div className="border rounded-lg p-5 bg-card space-y-4">
            <h2 className="font-semibold text-base">Details</h2>

            <DetailRow icon={<Building2 className="h-4 w-4" />} label="Company" value={car.tags.company} />
            <DetailRow icon={<Car className="h-4 w-4" />} label="Type" value={car.tags.carType} />
            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Dealer" value={car.tags.dealer} />
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Listed"
              value={formatDate(car.createdAt)}
            />
            {car.updatedAt !== car.createdAt && (
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Updated"
                value={formatDate(car.updatedAt)}
              />
            )}
          </div>

          {/* Custom Tags */}
          {car.tags.customTags.length > 0 && (
            <div className="border rounded-lg p-5 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-base">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {car.tags.customTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button className="w-full" asChild>
              <Link href={`/edit-car/${car._id}`} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Listing
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
