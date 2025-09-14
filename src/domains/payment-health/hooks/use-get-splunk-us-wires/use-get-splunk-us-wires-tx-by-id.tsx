// checked
import { useQuery } from '@tanstack/react-query';

import {
  getApiV2SplunkDataGetAmountTransactionDetailsDataOptions,
  getApiV2SplunkDataGetTransactionDetailsDataOptions,
} from '../../data/data-services/react-query.gen';

export function useGetSplunkUsWiresTransactionDetails(
  txId: string,
  datestart?: string,
  enddate?: string,
  enabled = !!txId
) {
  return useQuery({
    ...getApiV2SplunkDataGetTransactionDetailsDataOptions({
      query: {
        transactionId: txId,
        datestart,
        enddate,
      },
    }),
    enabled,
  });
}

export function useGetSplunkUsWiresTransactionDetailsByAmount(
  amount: string,
  startdate?: string,
  enddate?: string,
  enabled = !!amount
) {
  return useQuery({
    ...getApiV2SplunkDataGetAmountTransactionDetailsDataOptions({
      query: {
        amount,
        startdate,
        enddate,
      },
    }),
    enabled,
  });
}
