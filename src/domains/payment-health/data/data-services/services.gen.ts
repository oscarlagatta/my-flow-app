import {
  createClient,
  createConfig,
  type Options,
} from '@hey-api/client-axios';

import {
  GetApiV2SplunkDataGetAmountTransactionDetailsDataData,
  GetApiV2SplunkDataGetAmountTransactionDetailsDataError,
  GetApiV2SplunkDataGetAmountTransactionDetailsDataResponse,
  GetApiV2SplunkDataGetSplunkDataResponse,
  GetApiV2SplunkDataGetTransactionDetailsDataData,
  GetApiV2SplunkDataGetTransactionDetailsDataError,
  GetApiV3SplunkDataGetSplunkDataError,
} from '@/domains/payment-health/data/data-services/types,gen';
import { GetApiV2SplunkDataGetTransactionDetailsDataResponse } from '@/domains/payment-health/types/transaction-details-data-response';
import { ThrowOnError } from '@tanstack/query-core';

export const client = createClient(createConfig());

export const getApiV2SplunkDataGetSplunkData = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<unknown, ThrowOnError>
) => {
  return (options?.client ?? client).get<
    GetApiV2SplunkDataGetSplunkDataResponse,
    GetApiV3SplunkDataGetSplunkDataError,
    ThrowOnError
  >({
    ...options,
    url: `/api/v2/splunk/data/GetSplunkData`,
  });
};

export const getApiV2SplunkDataGetAmountTransactionDetailsData = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<
    GetApiV2SplunkDataGetAmountTransactionDetailsDataData,
    ThrowOnError
  >
) => {
  return (options?.client ?? client).get<
    GetApiV2SplunkDataGetAmountTransactionDetailsDataResponse,
    GetApiV2SplunkDataGetAmountTransactionDetailsDataError,
    ThrowOnError
  >({
    ...options,
    url: `/api/v2/splunk/data/getAmountTransactionDetailsData`,
  });
};

export const getApiV2SplunkDataGetTransactionDetailsData = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<
    GetApiV2SplunkDataGetTransactionDetailsDataData,
    ThrowOnError
  >
) => {
  return (options?.client ?? client).get<
    GetApiV2SplunkDataGetTransactionDetailsDataResponse,
    GetApiV2SplunkDataGetTransactionDetailsDataError,
    ThrowOnError
  >({
    ...options,
    url: `/api/v2/splunk/data/getTransactionDetailsData`,
  });
};
