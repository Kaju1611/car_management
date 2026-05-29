'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Upload, X, Loader2, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Car } from '@/types';

const carSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  company: z.string().min(1, 'Company is required'),
  carType: z.string().min(1, 'Car type is required'),
  dealer: z.string().min(1, 'Dealer is required'),
});

type CarFormValues = z.infer<typeof carSchema>;

interface CarFormProps {
  car?: Car;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export default function CarForm({ car, onSubmit, isLoading, submitLabel = 'Save Car' }: CarFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(car?.images || []);
  const [customTags, setCustomTags] = useState<string[]>(car?.tags.customTags || []);
  const [tagInput, setTagInput] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      title: car?.title || '',
      description: car?.description || '',
      company: car?.tags.company || '',
      carType: car?.tags.carType || '',
      dealer: car?.tags.dealer || '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + images.length + files.length;

    if (total > 10) {
      setImageError(`Maximum 10 images allowed. You can add ${10 - existingImages.length - images.length} more.`);
      return;
    }

    setImageError('');
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !customTags.includes(tag) && customTags.length < 10) {
      setCustomTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFormSubmit = async (data: CarFormValues) => {
    const totalImages = existingImages.length + images.length;
    if (totalImages === 0) {
      setImageError('At least one image is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags[company]', data.company);
    formData.append('tags[carType]', data.carType);
    formData.append('tags[dealer]', data.dealer);
    formData.append('tags[customTags]', JSON.stringify(customTags));

    // Existing images to keep
    if (car) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    // New images
    images.forEach((file) => {
      formData.append('images', file);
    });

    await onSubmit(formData);
  };

  const totalImages = existingImages.length + images.length;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g. 2024 Toyota RAV4 XLE Premium"
          {...register('title')}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the car's condition, features, history..."
          rows={4}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      {/* Tags grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            placeholder="e.g. Toyota"
            {...register('company')}
            className={errors.company ? 'border-destructive' : ''}
          />
          {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="carType">Car Type *</Label>
          <Input
            id="carType"
            placeholder="e.g. SUV, Sedan, Truck"
            {...register('carType')}
            className={errors.carType ? 'border-destructive' : ''}
          />
          {errors.carType && <p className="text-sm text-destructive">{errors.carType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dealer">Dealer *</Label>
          <Input
            id="dealer"
            placeholder="e.g. AutoPlex Motors"
            {...register('dealer')}
            className={errors.dealer ? 'border-destructive' : ''}
          />
          {errors.dealer && <p className="text-sm text-destructive">{errors.dealer.message}</p>}
        </div>
      </div>

      {/* Custom Tags */}
      <div className="space-y-2">
        <Label>Custom Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {customTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Press Enter or comma to add tags</p>
      </div>

      {/* Images */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Images * ({totalImages}/10)</Label>
          {totalImages < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Images
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {imageError && (
          <p className="text-sm text-destructive">{imageError}</p>
        )}

        {/* Image preview grid */}
        {totalImages > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Existing images */}
            {existingImages.map((url) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={url}
                  alt="Car image"
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-1 left-1">
                  <Badge variant="secondary" className="text-xs py-0 bg-black/60 text-white border-0">Saved</Badge>
                </div>
              </div>
            ))}

            {/* New images */}
            {images.map((file, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`New image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-1 left-1">
                  <Badge className="text-xs py-0 bg-green-600 border-0">New</Badge>
                </div>
              </div>
            ))}

            {/* Add more button in grid */}
            {totalImages < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 flex flex-col items-center gap-3 hover:border-primary hover:bg-muted/50 transition-colors"
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Click to upload images</p>
              <p className="text-sm text-muted-foreground">JPEG, PNG, WebP up to 10MB each. Max 10 images.</p>
            </div>
          </button>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none sm:min-w-32">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
