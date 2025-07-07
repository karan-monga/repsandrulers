import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { renphoApi } from '@/lib/renphoApi';
import { RenphoFilters, RenphoCSVRow } from '@/types/renpho';

// Renpho data hooks
export const useRenphoMeasurements = (filters?: RenphoFilters) => {
  return useQuery({
    queryKey: ['renpho-measurements', filters],
    queryFn: () => renphoApi.getMeasurements(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRenphoMeasurementsForChart = (filters?: RenphoFilters) => {
  return useQuery({
    queryKey: ['renpho-measurements-chart', filters],
    queryFn: () => renphoApi.getMeasurementsForChart(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLatestRenphoMeasurement = () => {
  return useQuery({
    queryKey: ['renpho-latest'],
    queryFn: () => renphoApi.getLatestMeasurement(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRenphoStats = (filters?: RenphoFilters) => {
  return useQuery({
    queryKey: ['renpho-stats', filters],
    queryFn: () => renphoApi.getStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useImportRenphoData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (csvData: RenphoCSVRow[]) => renphoApi.importCSVData(csvData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renpho-measurements'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-measurements-chart'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-latest'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-stats'] });
    },
  });
};

export const useDeleteRenphoMeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => renphoApi.deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renpho-measurements'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-measurements-chart'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-latest'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-stats'] });
    },
  });
};

export const useClearAllRenphoData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => renphoApi.clearAllMeasurements(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renpho-measurements'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-measurements-chart'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-latest'] });
      queryClient.invalidateQueries({ queryKey: ['renpho-stats'] });
    },
  });
}; 