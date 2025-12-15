import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  examplesService, 
  type BooleanExample, 
  type ExampleFilters,
  type CreateExampleDto 
} from '@/services/examples.service';
import { toast } from 'sonner';

/**
 * Query key factory for examples
 */
export const examplesKeys = {
  all: ['examples'] as const,
  lists: () => [...examplesKeys.all, 'list'] as const,
  list: (filters?: ExampleFilters) => [...examplesKeys.lists(), filters] as const,
  details: () => [...examplesKeys.all, 'detail'] as const,
  detail: (id: string) => [...examplesKeys.details(), id] as const,
  random: (filters?: Partial<ExampleFilters>) => [...examplesKeys.all, 'random', filters] as const,
};

/**
 * Get all examples with optional filtering
 * Uses React Query cache with 5-minute staleTime
 */
export function useExamples(filters?: ExampleFilters) {
  return useQuery({
    queryKey: examplesKeys.list(filters),
    queryFn: () => examplesService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Get a single example by ID
 */
export function useExample(id: string | undefined) {
  return useQuery({
    queryKey: examplesKeys.detail(id || ''),
    queryFn: () => examplesService.getById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get a random example
 * Note: staleTime is 0 to always fetch fresh random examples
 */
export function useRandomExample(filters?: Partial<ExampleFilters>) {
  return useQuery({
    queryKey: examplesKeys.random(filters),
    queryFn: () => examplesService.getRandom(filters),
    staleTime: 0, // Always fetch fresh
    gcTime: 0, // Don't cache
  });
}

/**
 * Create a new example
 */
export function useCreateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExampleDto) => examplesService.create(data),
    onSuccess: () => {
      // Invalidate all example queries
      queryClient.invalidateQueries({ queryKey: examplesKeys.all });
      toast.success('Example created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create example');
    },
  });
}

/**
 * Verify an example
 */
export function useVerifyExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examplesService.verify(id),
    onSuccess: (data, id) => {
      // Invalidate the specific example and lists
      queryClient.invalidateQueries({ queryKey: examplesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: examplesKeys.lists() });
      
      if (data.verified) {
        toast.success('Example verified successfully');
      } else {
        toast.error(`Verification failed: ${data.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify example');
    },
  });
}

/**
 * Verify all examples
 */
export function useVerifyAllExamples() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => examplesService.verifyAll(),
    onSuccess: (data) => {
      // Invalidate all example queries
      queryClient.invalidateQueries({ queryKey: examplesKeys.all });
      toast.success(`Verified ${data.verified}/${data.total} examples`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify examples');
    },
  });
}

/**
 * Helper hooks for filtering
 */
export function useExamplesByDifficulty(difficulty: BooleanExample['difficulty']) {
  return useExamples({ difficulty });
}

export function useExamplesByCategory(category: BooleanExample['category']) {
  return useExamples({ category });
}

export function useExamplesByVariableCount(variableCount: number) {
  return useExamples({ variableCount });
}
