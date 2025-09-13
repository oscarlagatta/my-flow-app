import { queryOptions } from '@tanstack/react-query';
import type { Options } from '@hey-api/client-axios';

import {
  GetApiV2SplunkDataGetAmountTransactionDetailsDataData,
  GetApiV2SplunkDataGetTransactionDetailsDataData,
} from '@/domains/payment-health/data/data-services/types,gen';
import {
  getApiV2SplunkDataGetAmountTransactionDetailsData,
  getApiV2SplunkDataGetTransactionDetailsData,
} from '@/domains/payment-health/data/data-services/service.gen';
import { client } from '@/lib/api/client.gen';

type QueryKey<TOptions extends Options> = [
  Pick<TOptions, 'baseURL' | 'body' | 'headers' | 'path' | 'query'> & {
    _id: string;
    _infinite?: boolean;
  },
];

const createQueryKey = <TOptions extends Options>(
  id: string,
  options?: TOptions,
  infinite?: boolean
): QueryKey<TOptions>[0] => {
  const params: QueryKey<TOptions>[0] = {
    _id: id,
    baseURL: (options?.client ?? client).getConfig().baseURL,
  } as QueryKey<TOptions>[0];

  if (infinite) {
    params._infinite = infinite;
  }
  if (options?.body) {
    params.body = options.body;
  }
  if (options?.headers) {
    params.headers = options.headers;
  }
  if (options?.path) {
    params.path = options.path;
  }
  if (options?.query) {
    params.query = options.query;
  }
  return params;
};

export const getApiV2SplunkDataGetTransactionDetailsDataQueryKey = (
  options?: Options<GetApiV2SplunkDataGetTransactionDetailsDataData>
) => [createQueryKey('getApiV2SplunkDataGetTransactionDetailsData', options)];

export const getApiV2SplunkDataGetTransactionDetailsDataOptions = (
  options?: Options<GetApiV2SplunkDataGetTransactionDetailsDataData>
) => {
  return queryOptions({
    queryFn: async ({ queryKey }) => {
      const { data } = await getApiV2SplunkDataGetTransactionDetailsData({
        ...options,
        ...queryKey[0],
        throwOnError: true,
      });
      return data;
    },
    queryKey: getApiV2SplunkDataGetTransactionDetailsDataQueryKey(options),
  });
};

export const getApiV2SplunkDataGetAmountTransactionDetailsDataQueryKey = (
  options?: Options<GetApiV2SplunkDataGetAmountTransactionDetailsDataData>
) => [
  createQueryKey('getApiV2SplunkDataGetAmountTransactionDetailsData', options),
];

export const getApiV2SplunkDataGetAmountTransactionDetailsDataOptions = (
  options?: Options<GetApiV2SplunkDataGetAmountTransactionDetailsDataData>
) => {
  return queryOptions({
    queryFn: async ({ queryKey }) => {
      const { data } = await getApiV2SplunkDataGetAmountTransactionDetailsData({
        ...options,
        ...queryKey[0],
        throwOnError: true,
      });
      return data;
    },
    queryKey:
      getApiV2SplunkDataGetAmountTransactionDetailsDataQueryKey(options),
  });
};
