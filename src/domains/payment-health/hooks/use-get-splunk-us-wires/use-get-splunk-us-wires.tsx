// checked
import { useQuery } from '@tanstack/react-query';

import { getApiV2SplunkDataGetSplunkDataOptions } from '../../data/data-services/react-query.gen';

import { SplunkDataItem } from '../../types/splunk-data-item';

interface UseGetSplunkUsWiresOptions {
  enabled?: boolean;
}

export function useGetSplunkUsWires(options: UseGetSplunkUsWiresOptions) {
  const { enabled } = options;

  const splunkData = useQuery({
    ...getApiV2SplunkDataGetSplunkDataOptions(),
    enabled,
  });

  return {
    data: splunkData.data as SplunkDataItem[],
    isLoading: splunkData.isLoading,
    isError: splunkData.isError,
    refetch: splunkData.refetch,
    isFetching: splunkData.isFetching,
    isSuccess: splunkData.isSuccess,
  };
}

// import splunkApiData from '@/domains/payment-health/data/splunk-api-data.json';

// export interface SplunkDataItem {
//   aiT_NUM: string;
//   aiT_NAME: string;
//   floW_DIRECTION: string;
//   floW_AIT_NUM: string;
//   floW_AIT_NAME: string;
//   iS_TRAFFIC_FLOWING: 'Yes' | 'No' | null;
//   iS_TRAFFIC_ON_TREND: string;
//   averagE_TRANSACTION_COUNT: string;
//   currenT_TRANSACTION_COUNT: string;
//   historiC_STD: string;
//   historiC_MEAN: string;
//   currenT_STD_VARIATION: string;
// }
//
// interface UseGetSplunkUsWiresOptions {
//   enabled?: true;
// }
//
// export function useGetSplunkUsWires(options: UseGetSplunkUsWiresOptions) {
//   const { enabled } = options;
//   const splunkData = useQuery({
//     queryKey: ['splunk-data'],
//     queryFn: async (): Promise<SplunkDataItem[]> => {
//       // Enhanced loading delay to demonstrate loading states
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//
//       // Simulate potential network issues (uncomment to test error states)
//       // if (Math.random() < 0.1) {
//       //   throw new Error('Failed to fetch Splunk data');
//       // }
//
//       // Return the imported JSON data
//       return splunkApiData as SplunkDataItem[];
//     },
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes (updated from deprecated cacheTime)
//     retry: 3,
//     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
//     enabled,
//   });
//
//   return {
//     data: splunkData.data,
//     isLoading: splunkData.isLoading,
//     isError: splunkData.isError,
//     error: splunkData.error,
//     refetch: splunkData.refetch,
//     isFetching: splunkData.isFetching,
//     isSuccess: splunkData.isSuccess,
//   };
// }
