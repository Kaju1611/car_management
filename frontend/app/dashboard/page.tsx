'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Car, Building2, MapPin, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SearchBar from '@/components/SearchBar';
import CarCard from '@/components/CarCard';
import { carsApi } from '@/services/api';
import { Car as CarType, CarStats, Pagination } from '@/types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [cars, setCars] = useState<CarType[]>([]);
  const [stats, setStats] = useState<CarStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<'-createdAt' | 'createdAt'>('-createdAt');

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await carsApi.getStats();
      setStats(response.data.data);
    } catch {
      // Non-critical
    }
  };

  const fetchCars = useCallback(async (page = 1, sortOrder = sort) => {
    setIsLoading(true);
    try {
      const response = await carsApi.getAll({ page, limit: 12, sort: sortOrder });
      setCars(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [sort]);

  const searchCars = useCallback(async (query: string, page = 1) => {
    if (!query.trim()) {
      setSearchQuery('');
      fetchCars(1);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    try {
      const response = await carsApi.search(query, { page, limit: 12 });
      setCars(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  }, [fetchCars]);

  useEffect(() => {
    fetchCars(1, sort);
    setCurrentPage(1);
  }, [sort, fetchCars]);

  const handleSearch = useCallback((query: string) => {
    setCurrentPage(1);
    searchCars(query, 1);
  }, [searchCars]);

  const handleDelete = async (id: string) => {
    try {
      await carsApi.delete(id);
      toast.success('Car deleted successfully');
      setCars((prev) => prev.filter((c) => c._id !== id));
      if (stats) {
        setStats({ ...stats, totalCars: stats.totalCars - 1 });
      }
      // Refresh if page is now empty
      if (cars.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        if (searchQuery) {
          searchCars(searchQuery, newPage);
        } else {
          fetchCars(newPage);
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (searchQuery) {
      searchCars(searchQuery, page);
    } else {
      fetchCars(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSort = () => {
    setSort((prev) => (prev === '-createdAt' ? 'createdAt' : '-createdAt'));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats ? (
          <>
            <StatCard
              icon={<Car className="h-5 w-5" />}
              label="Total Cars"
              value={stats.totalCars}
              color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
            />
            <StatCard
              icon={<Building2 className="h-5 w-5" />}
              label="Companies"
              value={stats.totalCompanies}
              color="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
            />
            <StatCard
              icon={<MapPin className="h-5 w-5" />}
              label="Dealers"
              value={stats.totalDealers}
              color="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
            />
          </>
        ) : (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 w-full">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by title, company, dealer, type, or tags..."
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={toggleSort} className="gap-2">
            {sort === '-createdAt' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
            {sort === '-createdAt' ? 'Newest' : 'Oldest'}
          </Button>
          <Button size="sm" asChild>
            <Link href="/create-car" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Car
            </Link>
          </Button>
        </div>
      </div>

      {/* Search query indicator */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {isSearching ? 'Searching...' : `${pagination?.total || 0} results for "${searchQuery}"`}
        </p>
      )}

      {/* Cars Grid */}
      {isLoading || isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="aspect-[16/9] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : cars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <EmptyState hasSearch={!!searchQuery} />
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-9"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Car className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {hasSearch ? 'No cars found' : 'No cars yet'}
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        {hasSearch
          ? 'Try adjusting your search query to find what you\'re looking for.'
          : 'Start by adding your first car listing. You can upload up to 10 images per car.'}
      </p>
      {!hasSearch && (
        <Button asChild>
          <Link href="/create-car" className="gap-2">
            <Plus className="h-4 w-4" />
            Add your first car
          </Link>
        </Button>
      )}
    </div>
  );
}
