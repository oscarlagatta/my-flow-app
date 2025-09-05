import type { Node } from '@xyflow/react';

export type AppNode = Omit<Node, 'parentNode'> & {
  parentId?: string;
};
