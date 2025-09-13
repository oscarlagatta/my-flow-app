import { useCallback, useMemo, useState } from 'react';

import {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  ModuleRegistry,
} from '@ag-grid-community/core';

import { AgGridReact } from '@ag-grid-community/react';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { useTransactionUsWiresSearchContext } from '@/domains/payment-health/providers/us-wires/us-wires-transaction-search-provider';
import { SplunkTransactionDetail } from '@/domains/payment-health/types/splunk-transaction';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule]);

interface TransactionRow {
  id: string;

  [key: string]: any;
}

// utility function to format source type by separating words
const formatSourceType = (sourceType: string) => {
  return sourceType
    .replace(/[-_]/g, ' ') // replace dashes and underscores with spaces
    .replace(/([a-z])([A-Z])/g, ' $1 $2')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export function TransactionDetailsTableAgGrid() {
  const { results, selectedAitId, hideTable, id } =
    useTransactionUsWiresSearchContext();

  const { sourceTypeTables, allColumns } = useMemo(() => {
    if (!results || !selectedAitId)
      return { sourceTypeTables: [], allColumns: [] };

    const relevantResults = results.filter(
      (detail) => detail.aitNumber === selectedAitId
    );

    const groupedBySourceType: Record<string, SplunkTransactionDetail[]> =
      relevantResults.reduce(
        (
          acc: Record<string, SplunkTransactionDetail[]>,
          detail: SplunkTransactionDetail
        ) => {
          const sourceType: string = detail.sourceType || 'Unknown Source Type';
          if (!acc[sourceType]) {
            acc[sourceType] = [];
          }
          acc[sourceType].push(detail);
          return acc;
        },
        {} as Record<string, typeof relevantResults>
      );

    const allColumnsSet = new Set<string>();
    relevantResults.forEach((detail) => {
      if (detail._raw) {
        const rawData = detail._raw as Record<string, any>;
        Object.keys(rawData).forEach((key) => {
          if (
            key.toLowerCase() !== 'ait_name' &&
            key.toLowerCase() !== 'ait_number'
          ) {
            allColumnsSet.add(key);
          }
        });
      }
    });

    const allColumns = Array.from(allColumnsSet).sort();

    const sourceTypeTables = Object.entries(groupedBySourceType).map(
      ([sourceType, details]) => {
        const rowData: TransactionRow[] = details.map((detail, index) => {
          const row: TransactionRow = {
            id: `${sourceType}-${index}`,
          };

          if (detail._raw) {
            const rawData = detail._raw as Record<string, any>;
            Object.keys(rawData).forEach((column) => {
              const value = rawData[column];
              row[column] = value !== null && value !== undefined ? value : '';
            });
          }

          return row;
        });

        return {
          sourceType,
          aitName: details[0].aitName || 'Unknown AIT Name',
          aitNumber: details[0].aitNumber || 'Unknown AIT Number',
          recordCount: details.length,
          rowData,
        };
      }
    );

    return { sourceTypeTables, allColumns };
  }, [results, selectedAitId]);

  // Initialize expanded tables with the first sourceType if available
  const [expandedTables, setExpandedTables] = useState<Set<string>>(() => {
    if (sourceTypeTables.length > 0) {
      return new Set([sourceTypeTables[0].sourceType]);
    }
    return new Set();
  });

  const formatColumnName = (columnName: string) => {
    return columnName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCellValue = (value: any, columnName: string) => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'null'
    ) {
      return '-';
    }

    if (columnName.includes('DATE') || columnName.includes('TS')) {
      const timestamp = Date.parse(value);
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
      return value;
    }

    if (columnName.includes('AMT') && !isNaN(Number(value))) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
    }

    return String(value);
  };

  const createColumnDefs = useCallback((columns: string[]): ColDef[] => {
    return columns.map((column) => ({
      headerName: formatColumnName(column),
      field: column,
      sortable: true,
      resizable: true,
      autoHeaderGroupWidth: true,
      flex: 1,
      minWidth: 150,
      maxWidth: 400,
      cellRenderer: (params: ICellRendererParams) => {
        return formatCellValue(params.value, column);
      },
    }));
  }, []);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      flex: 1,
      minWidth: 150,
      maxWidth: 400,
      autoHeaderHeight: true,
      wrapHeaderText: true,
      suppressSizeToFit: true,
    }),
    []
  );

  const gridOptions = useMemo(
    () => ({
      suppressHorizontalScroll: false,
      alwaysShowVerticalScroll: true,
      suppressColumnVirtualisation: false,
      enableRangeSelection: true,
      rowSelection: 'multiple' as const,
      animateRows: true,
      supressRowHoverHighlight: false,
    }),
    []
  );

  const tobbleTable = (sourceType: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(sourceType)) {
      newExpanded.delete(sourceType);
    } else {
      newExpanded.add(sourceType);
    }
    setExpandedTables(newExpanded);
  };

  const expandAllTables = () => {
    setExpandedTables(
      new Set(sourceTypeTables.map((table) => table.sourceType))
    );
  };

  const collapseAllTables = () => {
    setExpandedTables(new Set());
  };

  if (!results || !selectedAitId || !sourceTypeTables.length) {
    return (
      <div className="w-full">
        <div className="rounded-lg border-b bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              onClick={hideTable}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-grey-900 text-xl font-semibold">
                Transaction Details
              </h1>
              <p className="text-sm text-gray-600">
                No transaction data available
              </p>
            </div>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-500">No transaction data found</p>
            <p className="mt-2 text-sm text-gray-400">
              Please perform a search to view transaction details
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 rounded-lg border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button
            onClick={hideTable}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <p className="text-sm text-gray-600">
              {selectedAitId} - Transaction ID: {id} - {sourceTypeTables.length}{' '}
              Source Type(s)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={expandAllTables}
            variant="outline"
            size="sm"
            className="bg-transparent text-xs"
          >
            <span>Expand All</span>
          </Button>
          <Button
            onClick={collapseAllTables}
            variant="outline"
            size="sm"
            className="bg-transparent text-xs"
          >
            <span>Collapse All</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {sourceTypeTables.map((table) => {
          const isExpanded = expandedTables.has(table.sourceType);
          return (
            <div
              key={table.sourceType}
              className="overflow-hidden rounded-lg border-gray-200 shadow-sm"
            >
              <div
                className="cursor-pointer border-b bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                onClick={() => tobbleTable(table.sourceType)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div className="space-3 flex items-center">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <h3 className="text-l font-semibold text-gray-900">
                        {table.aitName} ({table.aitNumber}) -{' '}
                        {formatSourceType(table.sourceType)}
                      </h3>
                      <span className="5 5 rounded bg-blue-100 px-2 py-0 text-sm font-medium text-blue-800">
                        {table.recordCount} records
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="w-full"
                    style={{
                      height: `{Math.min(table.recordCount * 35 + 200, 600)}px`,
                    }}
                  >
                    <div className="ag-theme-quartz h-full w-full">
                      <AgGridReact
                        rowData={table.rowData}
                        columnDefs={createColumnDefs(allColumns)}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        pagination={true}
                        paginationPageSize={10}
                        animateRows={true}
                        suppressRowHoverHighlight={false}
                        suppressHorizontalScroll={false}
                        alwaysShowHorizontalScroll={true}
                        suppressColumnVirtualisation={false}
                        skipHeaderOnAutoSize={false}
                        getRowStyle={(params) => {
                          return params.node.rowIndex! % 2 === 0
                            ? { backgroundColor: '#fffff' }
                            : { backgroundColor: '#f8fafc' };
                        }}
                        onGridReady={(params: GridReadyEvent) => {
                          setTimeout(() => {
                            params.api.sizeColumnsToFit();
                          }, 100);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
