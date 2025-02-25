/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useQuery,
} from '@tanstack/react-query';
import { FindSLOResponse } from '@kbn/slo-schema';

import { useKibana } from '../../utils/kibana_react';

interface SLOListParams {
  name?: string;
  page?: number;
  sortBy?: string;
  indicatorTypes?: string[];
}

export interface UseFetchSloListResponse {
  isInitialLoading: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  sloList: FindSLOResponse | undefined;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<FindSLOResponse | undefined, unknown>>;
}

export function useFetchSloList({
  name = '',
  page = 1,
  sortBy = 'name',
  indicatorTypes = [],
}: SLOListParams | undefined = {}): UseFetchSloListResponse {
  const { http } = useKibana().services;

  const { isInitialLoading, isLoading, isError, isSuccess, isRefetching, data, refetch } = useQuery(
    {
      queryKey: ['fetchSloList', { name, page, sortBy, indicatorTypes }],
      queryFn: async ({ signal }) => {
        try {
          const response = await http.get<FindSLOResponse>(`/api/observability/slos`, {
            query: {
              ...(page && { page }),
              ...(name && { name }),
              ...(sortBy && { sortBy }),
              ...(indicatorTypes &&
                indicatorTypes.length > 0 && {
                  indicatorTypes: indicatorTypes.join(','),
                }),
            },
            signal,
          });

          return response;
        } catch (error) {
          // ignore error
        }
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 1000,
    }
  );

  return {
    sloList: data,
    isLoading: isLoading || isRefetching,
    isInitialLoading,
    isSuccess,
    isError,
    refetch,
  };
}
