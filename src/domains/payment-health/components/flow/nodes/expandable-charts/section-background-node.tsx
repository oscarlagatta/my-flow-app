import type { Node, NodeProps } from '@xyflow/react';

type SectionBackgroundNodeProps = {
  title: string;
  color: string;
  isDimmed?: boolean;
};

type SectionBackgroundNodeType = Node<SectionBackgroundNodeProps>;

const SectionBackgroundNode = ({
  data,
}: NodeProps<SectionBackgroundNodeType>) => {
  return (
    <div
      className={`h-full w-full rounded-lg bg-white shadow-xl transition-all duration-200 ${data.isDimmed} ? 'opacity-60' : ''}`}
    >
      <div className="p-4">
        <h2 className="mb-2 text-center text-lg font-bold text-gray-700">
          {data.title}
        </h2>
      </div>
    </div>
  );
};

export default SectionBackgroundNode;
