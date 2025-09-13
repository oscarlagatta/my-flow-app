'use client';

import type React from 'react';

import { memo, useMemo, useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import {
  computeTrendColors,
  getTrendColorClass,
  type TrendColor,
} from '../../../../utils/trend-color-utils';

import {
  computeTrafficStatusColors,
  getTrafficStatusColorClass,
  type TrafficStatusColor,
} from '../../../../utils/traffic-status-utils';
import { LoadingButton } from '../../../loading/loading-button';
import { CardLoadingSkeleton } from '../../../loading/loading-skeleton';
import { useGetSplunkUsWires } from '@/domains/payment-health/hooks/use-get-splunk-us-wires/use-get-splunk-us-wires';
import { useTransactionUsWiresSearchContext } from '@/domains/payment-health/providers/us-wires/us-wires-transaction-search-provider';

type ActionType = 'flow' | 'trend' | 'balanced';

type CustomNodeData = {
  title: string;
  subtext: string;
  size: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  isConnected?: boolean;
  isDimmed?: boolean;
  onClick?: (nodeId: string) => void;
  onActionClick?: (aitNum: string, action: ActionType) => void;
};

type CustomNodeType = Node<CustomNodeData>;

const CustomNodeUsWires = ({
  data,
  id,
  onHideSearch,
}: NodeProps<CustomNodeType> & { onHideSearch: () => void }) => {
  // const { hasRequiredRole } = useAuthzRules();
  const isAuthorized = true; // hasRequiredRole();

  // parameter enabled: isAuthorized
  const {
    data: splunkData,
    isLoading,
    isError,
    isFetching,
  } = useGetSplunkUsWires({
    enabled: isAuthorized,
  });

  const {
    active: txActive,
    isFetching: txFetching,
    matchedAitIds,
    showTable,
  } = useTransactionUsWiresSearchContext();

  // Extract AIT number from the node data subtext (format: "AIT {number}")
  const aitNum = useMemo(() => {
    const match = data.subtext.match(/AIT (\d+)/);
    return match ? match[1] : null;
  }, [data.subtext, id]);

  // Compute trend colors from Splunk data
  const trendColorMapping = useMemo(() => {
    if (!splunkData) return {};
    return computeTrendColors(splunkData);
  }, [splunkData]);

  // Compute traffic status colors from Splunk data
  const trafficStatusMapping = useMemo(() => {
    if (!splunkData) return {};
    return computeTrafficStatusColors(splunkData);
  }, [splunkData]);

  // Get the trend color for this specific node
  const trendColor: TrendColor =
    aitNum && trendColorMapping[aitNum] ? trendColorMapping[aitNum] : 'grey';

  // Get the traffic status color for this specific node
  const trafficStatusColor: TrafficStatusColor =
    aitNum && trafficStatusMapping[aitNum]
      ? trafficStatusMapping[aitNum]
      : 'grey';

  const trendColorClass = getTrendColorClass(trendColor);
  const trafficStatusColorClass =
    getTrafficStatusColorClass(trafficStatusColor);

  const handleClick = () => {
    if (data.onClick && id && !isLoading) {
      data.onClick(id);
    }
  };

  const triggerAction = (action: ActionType) => {
    if (!isLoading && !isFetching && aitNum && data.onActionClick) {
      data.onActionClick(aitNum, action);
    }
    onHideSearch(); // Hide search when an action is triggered.
  };

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const handleDetailsClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection

    if (aitNum && !isDetailsLoading) {
      setIsDetailsLoading(true);
      try {
        await showTable(aitNum);
      } finally {
        setTimeout(() => {
          setIsDetailsLoading(false);
        }, 500);
      }
    }
  };

  // Determine styling based on selection state and loading
  const getCardClassName = () => {
    let baseClass =
      'border-2 border-[rgb(10, 49,97)] shadow-md cursor-pointer transition-all duration-200';

    // Loading state styling with glassmorphism
    if (isLoading || isFetching) {
      baseClass += ' bg-gray-50';
    } else if (isError) {
      baseClass += ' bg-red-50 border-red-200';
    } else {
      baseClass += ' bg-gray';
    }

    if (data.isSelected && !isLoading) {
      baseClass += ' ring-2 ring-blue-700 shadow-lg scale-105';
    } else if (data.isConnected && !isLoading) {
      baseClass += ' ring-2 ring-blue-300 shadow-lg';
    } else if (data.isDimmed) {
      baseClass += ' opacity-40';
    }

    return baseClass;
  };

  // Show loading skeleton during initial load of Splunk (baseline) data
  if (isLoading) {
    return <CardLoadingSkeleton className="w-full" />;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Failed to load data. Please try again later.
      </div>
    );
  }

  // Three-phase UI logic for buttons:
  // 1) Default mode (no txActive): show Flow/Trend/Balanced
  // 2) Loading mode (txActive && txFetching): show Summary/Details (loading) on all nodes to indicate a fetch is happening
  // 3) Results mode (txActive && !txFetching): show Summary/Details only on AITs present in matchedAitIds, show NO buttons otherwise
  const inDefaultMode = !txActive;
  const inLoadingMode = txActive && txFetching;
  const inResultsMode = txActive && !txFetching;
  const isMatched = !!aitNum && matchedAitIds.has(aitNum);

  return (
    <Card
      className={getCardClassName()}
      onClick={handleClick}
      data-testid={`custom-node-${id}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-2 w-2 !bg-gray-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-2 w-2 !bg-gray-400"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="h-2 w-2 !bg-gray-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-2 w-2 !bg-gray-400"
      />
      <CardHeader className="p-2">
        <CardTitle className="text-center text-xs font-bold whitespace-nowrap">
          {data.title}
        </CardTitle>
        <p className="text-muted-foreground text-center text-[10px]">
          {data.subtext}
        </p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex space-x-1 transition-all duration-200">
          {!isAuthorized ? (
            <>
              <LoadingButton
                isLoading={inLoadingMode}
                loadingText="..."
                variant="outline"
                className={`h-6 min-w-0 flex-1 px-2 text-[10px] shadow-sm ${
                  inResultsMode && isMatched
                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                    : inResultsMode && !isMatched
                      ? 'cursor-not-allowed border-gray-300 text-gray-500'
                      : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                }`}
                disabled={!isMatched}
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={true}
                loadingText="..."
                variant="outline"
                className={`h-6 min-w-0 flex-1 px-2 text-[10px] shadow-sm ${
                  inResultsMode && isMatched
                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                    : inResultsMode && !isMatched
                      ? 'cursor-not-allowed border-gray-300 text-gray-500'
                      : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                }`}
                onClick={
                  inResultsMode && isMatched ? handleDetailsClick : undefined
                }
                disabled={!isMatched || isDetailsLoading}
              >
                Details
              </LoadingButton>
            </>
          ) : (
            <>
              {inDefaultMode && (
                <>
                  <LoadingButton
                    isLoading={isFetching}
                    loadingText="..."
                    variant="outline"
                    className={`h-6 min-w-0 flex-1 px-2 text-[10px] text-white shadow-sm ${
                      isError ? 'bg-gray-400' : trafficStatusColorClass
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAction('flow');
                    }}
                    disabled={trafficStatusColorClass === 'bg-gray-400'}
                  >
                    Flow
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isFetching}
                    loadingText="..."
                    variant="outline"
                    className={`h-6 min-w-0 flex-1 px-2 text-[10px] text-white shadow-sm ${isError ? 'bg-gray-400' : trendColorClass}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAction('trend');
                    }}
                    disabled={trendColorClass === 'bg-gray-400'}
                  >
                    Trend
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isFetching}
                    loadingText="..."
                    variant="outline"
                    className="h-6 min-w-0 flex-1 px-2 text-[10px] shadow-sm"
                    disabled={trendColorClass === 'bg-gray-400'}
                  >
                    Balanced
                  </LoadingButton>
                </>
              )}

              {inLoadingMode && (
                <>
                  <LoadingButton
                    isLoading={true}
                    loadingText="..."
                    variant="outline"
                    aria-label="Trigger Summary Action"
                    className="flex h-6 flex-1 items-center justify-center border-blue-600 bg-blue-600 px-2 text-[10px] text-white shadow-sm hover:bg-blue-700 hover:text-white"
                  >
                    Summary
                  </LoadingButton>
                  <LoadingButton
                    isLoading={true}
                    loadingText="..."
                    variant="outline"
                    aria-label="Trigger Details Action"
                    className="flex h-6 flex-1 items-center justify-center border-blue-600 bg-blue-600 px-2 text-[10px] text-white shadow-sm hover:bg-blue-700 hover:text-white"
                  >
                    Details
                  </LoadingButton>
                </>
              )}

              {inResultsMode && (
                <>
                  <LoadingButton
                    isLoading={false}
                    loadingText="..."
                    variant="outline"
                    aria-label="Trigger Summary Action"
                    className={`h-6 min-w-0 flex-1 px-2 text-[10px] shadow-sm ${
                      isMatched
                        ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                        : 'cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500'
                    }`}
                    disabled={!isMatched}
                  >
                    Summary
                  </LoadingButton>
                  <LoadingButton
                    isLoading={false}
                    loadingText="..."
                    variant="outline"
                    aria-label="Trigger Summary Action"
                    className={`h-6 min-w-0 flex-1 px-2 text-[10px] shadow-sm ${
                      isMatched
                        ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                        : 'cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500'
                    }`}
                    onClick={isMatched ? handleDetailsClick : undefined}
                    disabled={!isMatched || isDetailsLoading}
                  >
                    Details
                  </LoadingButton>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(CustomNodeUsWires);
