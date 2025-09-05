import { MarkerType } from '@xyflow/react';
import { type AppNode } from '../types/app-node';

export const edgeStyle = { stroke: '#b57228', strokeWidth: 2 };
export const marker = { type: MarkerType.ArrowClosed, color: '#b57228' };

export function transformApiData(
  apiData: { nodes: any[]; edges: any[] },
  backgroundNodes: AppNode[],
  classToParentId: Record<string, string>,
  sectionPositions: Record<
    string,
    { baseX: number; positions: { x: number; y: number }[] }
  >
) {
  const sectionCounters: Record<string, number> = Object.keys(
    sectionPositions
  ).reduce((acc, key: string) => ({ ...acc, [key]: 0 }), {});

  const transformedNodes: AppNode[] = apiData.nodes
    .map((apiNode: any) => {
      const parentId =
        apiNode.class && classToParentId[apiNode.class]
          ? classToParentId[apiNode.class]
          : null;

      const sectionConfig =
        parentId !== null ? sectionPositions[parentId] : undefined;
      const positionIndex =
        parentId !== null ? sectionCounters[parentId]!++ : 0;
      const position =
        parentId !== null && sectionConfig
          ? sectionConfig.positions[positionIndex] || {
              x: sectionConfig.baseX,
              y: 180 + positionIndex * 120,
            }
          : { x: 0, y: 0 };

      return {
        id: apiNode.id,
        type: 'custom' as const,
        position,
        data: { title: apiNode.data.label, subtext: `AIT ${apiNode.id}` },
        parentId,
        extent: 'parent' as const,
      };
    })
    .filter((n: AppNode | null): n is AppNode => n !== null);

  const transformedEdges = apiData.edges.flatMap((apiEdge: any) => {
    const { source, target } = apiEdge;
    if (Array.isArray(target)) {
      return target.map((t: any) => ({
        id: `${source}-${t}`,
        source,
        target: t,
        type: 'smoothstep',
        style: edgeStyle,
        markerStart: marker,
        markerEnd: marker,
      }));
    } else {
      return [
        {
          ...apiEdge,
          id: `${source}-${target}`,
          type: 'smoothstep',
          style: edgeStyle,
          markerStart: marker,
          markerEnd: marker,
        },
      ];
    }
  });

  return { transformedNodes, transformedEdges };
}
