// checked with issues
'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  RowClickedEvent,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { useGetSplunkUsWiresTransactionDetailsByAmount } from '@/domains/payment-health/api/generated/hooks';
import { useTransactionSearchUsWiresContext } from '@/domains/payment-health/providers/us-wires/us-wires-transaction-search-provider';

interface TransactionRow {
  id: string;
  transactionRef: string;
  amount: string;
  currency: string;
  date: string;
  source: string;
  destination: string;
  country: string;
  status: string;
  aitNumber: string;
  aitName: string;
  [key: string]: any;
}

interface TransactionSearchResultsGridProps {
  transactionAmount: string;
  dateStart?: string;
  dateEnd?: string;
  onBack: () => void;
}

export function TransactionSearchResultsGrid({
  transactionAmount,
  dateStart,
  dateEnd,
  onBack,
}: TransactionSearchResultsGridProps) {
  const { search } = useTransactionSearchUsWiresContext();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionRow | null>();

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useGetSplunkUsWiresTransactionDetailsByAmount(
    transactionAmount,
    dateStart,
    dateEnd
  );

  console.log('[] Amount search API response: ', apiResponse);

  const formatCellValue = useCallback((value: any, columnName: string) => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'null'
    ) {
      return '-';
    }

    // Format Dates
    if (columnName.includes('DATE') || columnName.includes('TS')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
      } catch (e) {
        // if date parsing fails return original value
        return value;
      }
    }

    // Format amounts
    if (columnName.includes('AMT') || columnName === 'amount') {
      const numValue = Number.parseFloat(value);
      if (isNaN(numValue)) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(numValue);
      }
    }

    return String(value);
  }, []);

  const { rowData, totalTransactions } = useMemo(() => {
    if (!apiResponse || !Array.isArray(apiResponse)) {
      return { rowData: [], totalTransactions: 0 };
    }

    // sbK_REF_NUM
    // const transformedData: TransactionRow[] = apiResponse.map(
    //   (transaction, index) => {
    //     const raw = transaction;
    //     return {
    //       // id: raw.sbK_REF_NUM || `Transaction-${index}`,
    //       // transactionRef: raw.trN_REF || '-',
    //       // amount: raw.dbT_AMOUNT
    //       //   ? Number.parseFloat(raw.dbT_AMOUNT).toFixed(2)
    //       //   : '0',
    //       // currency: raw.dbT_CUR || 'USD',
    //       // date: raw.valuE_DATE || '-',
    //       // source: raw.source || '-', // corrected field name
    //       // destination: raw.SMH_DEST || '-',
    //       // country: raw.enD_COUNTRY || '-',
    //       // status: raw.status || '-', // included status
    //       // aitNumber: raw.aitNumber || '-',
    //       // aitName: raw.aitName || '-',
    //       // orpRefNum: raw.orP_REF_NUM || '-',
    //       // sbkRefNum: raw.sbK_REF_NUM || '-',
    //       // INCLUDE ALL RAW DATA FOR DETAILED VIEW
    //       ...raw, // ensure full raw data is added in case of detailed view requirement
    //     };
    //   }
    // );

    const transformedData: TransactionRow[] = apiResponse.map(
      (transaction, index) => ({
        id: `txn-${index}-${Date.now()}`,
        transactionRef: `REF-${index}`,
        amount: '0.00',
        currency: 'USD',
        date: new Date().toISOString(),
        source: 'TEMP_SOURCE',
        destination: 'TEMP_DESTINATION',
        country: 'US',
        status: 'PENDING',
        aitNumber: 'TEMP_AIT',
        aitName: 'Temporary AIT System',
        // Preserve original data
        _originalData: transaction,
      })
    );

    return {
      rowData: transformedData,
      totalTransactions: transformedData.length,
    };
  }, [apiResponse]);

  const columnDefs = useMemo(
    (): ColDef[] => [
      {
        headerName: 'Transaction Ref',
        field: 'transactionRef',
        sortable: true,
        filter: true,
        width: 180,
        pinned: 'left',
        cellStyle: { textAlign: 'right' },
      },
      {
        headerName: 'SBK Ref',
        field: 'id',
        sortable: true,
        filter: true,
        width: 180,
        pinned: 'left',
        cellStyle: { textAlign: 'right' },
      },
      {
        headerName: 'Amount',
        field: 'amount',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 120,
        cellStyle: { textAlign: 'right' },
        cellRenderer: (params: ICellRendererParams) => {
          return formatCellValue(params.value, 'amount');
        },
      },
      {
        headerName: 'Currency',
        field: 'currency',
        sortable: true,
        filter: true,
        width: 100,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Date',
        field: 'date',
        sortable: true,
        filter: 'agDateColumnFilter',
        width: 150,
        cellStyle: { textAlign: 'right' },
        cellRenderer: (params: ICellRendererParams) => {
          return formatCellValue(params.value, 'DATE');
        },
      },
      {
        headerName: 'Source',
        field: 'source',
        sortable: true,
        filter: true,
        width: 100,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Destination',
        field: 'destination',
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        headerName: 'Country',
        field: 'country',
        sortable: true,
        filter: true,
        width: 100,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'AIT System',
        field: 'aitName',
        sortable: true,
        filter: true,
        width: 150,
      },
    ],
    [formatCellValue]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const onRowClicked = useCallback(
    (event: RowClickedEvent) => {
      const transaction = event.data;
      const transactionId = event.data.id;

      console.log('transaction selected: ', transactionId);

      // set the selected transaction to display details
      setSelectedTransaction(transaction);

      // use the existing search functionality to load transaction details
      search(transaction.id);
    },
    [search]
  );

  if (isLoading) {
    return (
      <div className="h-full w-full">
        <div className="mb-3 rounded-lg border border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <Skeleton className="mb-2 h-6 w-48" />
              </div>
            </div>
          </div>

          <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            {[1].map((index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-gray-200 shadow-sm"
              >
                {/*Table header skeletons*/}
                <div className="bg-gray-5- border-b px-4 py-3">
                  <div className="jusitfy-between flex items-center">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                </div>

                {/*AG Grid Table Skeleton*/}
                <div className="w-full p-4">
                  <div className="space-y-3">
                    {/*Header row skeleton*/}
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                        <Skeleton
                          key={col}
                          className="h-10 min-w-[120px] flex-1"
                        />
                      ))}
                    </div>
                    {/*Data rows skeleton*/}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                      <div key={row} className="flex space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                          <Skeleton
                            key={col}
                            className="h-10 min-w-[120px] flex-1"
                          />
                        ))}
                      </div>
                    ))}

                    {/*Pagination skeleton*/}
                    <div className="flex items-center justify-end pt-4">
                      <Skeleton className="h-8 w-32" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-lg text-red-600">
            Error loading transaction data
          </p>
          <p className="mb-4 text-gray-600">
            {error?.message || 'Failed to fetch transactions'}
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {/*HEADER*/}
      <div className="mb-3 rounded-lg border border-b border-gray-200 bg-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <p className="text-sm text-gray-600">
                Amount: ${transactionAmount} - {totalTransactions} Transactions
                found
                {dateStart && `- From: ${dateStart}`}
                {dateEnd && `- To: ${dateEnd}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*AG GRID*/}

      <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="ag-theme-quartz h-full w-full">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100, 200]}
            animateRows={true}
            suppressRowHoverHighlight={false}
            domLayout="autoHeight"
            rowSelection="single"
            onRowClicked={onRowClicked}
            suppressHorizontalScroll={false}
            alwaysShowHorizontalScroll={true}
            suppressColumnVirtualisation={false}
            getRowStyle={(params) => {
              return params.node.rowIndex! % 2 === 0
                ? { background: '#ffffff', cursor: 'pointer' }
                : { background: '#f8fafc', cursor: 'pointer' };
            }}
            onGridReady={(params: GridReadyEvent) => {
              setTimeout(() => {
                if (params.api) {
                  params.api.sizeColumnsToFit();
                }
              }, 100);
            }}
          />
        </div>
      </div>
    </div>
  );
}
