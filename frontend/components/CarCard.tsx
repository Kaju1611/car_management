'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Car, MapPin, Building2, Tag, Pencil, Trash2, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { formatRelativeDate } from '@/lib/utils';
import { Car as CarType } from '@/types';

interface CarCardProps {
  car: CarType;
  onDelete: (id: string) => void;
}

export default function CarCard({ car, onDelete }: CarCardProps) {
  return (
    <Link href={`/car/${car._id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {car.images.length > 0 ? (
            <Image
              src={car.images[0]}
              alt={car.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Image count badge */}
          {car.images.length > 1 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-white text-xs">
              <Images className="h-3 w-3" />
              {car.images.length}
            </div>
          )}

          {/* Car type badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs">
              {car.tags.carType}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors mb-2">
            {car.title}
          </h3>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span>{car.tags.company}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{car.tags.dealer}</span>
          </div>
        </div>

        {/* Custom tags */}
        {car.tags.customTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {car.tags.customTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs py-0">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
            {car.tags.customTags.length > 3 && (
              <Badge variant="outline" className="text-xs py-0">
                +{car.tags.customTags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">{formatRelativeDate(car.createdAt)}</span>

          <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/edit-car/${car._id}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Car</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &ldquo;{car.title}&rdquo;? This action cannot be undone and will also remove all associated images.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(car._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
      </Card>
    </Link>
  );
}
