// checked
import type { Node, NodeProps } from '@xyflow/react';
import SectionDurationBadge from '@/domains/payment-health/components/badges/section-duration-badge';

type SectionBackgroundNodeProps = {
  title: string;
  color: string;
  isDimmed?: boolean;
  duration?: number;
  trend?: 'up' | 'down' | 'stable';
};

type SectionBackgroundNodeType = Node<SectionBackgroundNodeProps>;

const SectionBackgroundNode = ({
  data,
}: NodeProps<SectionBackgroundNodeType>) => {
  return (
    <div
      className={`h-full w-full rounded-lg bg-white shadow-xl transition-all duration-200 ${
        data.isDimmed
      } ? 'opacity-60' : '' }`}
    >
      <div className="p-4">
        {data.duration && (
          <div className="mb-3 flex justify-center">
            <SectionDurationBadge
              duration={data.duration}
              sectionName={data.title}
              trend={data.trend || 'stable'}
              className="shadow-sm"
            />
          </div>
        )}
        <h2 className="mb-2 text-center text-lg font-bold text-gray-700">
          {data.title}
        </h2>
      </div>
    </div>
  );
};

export default SectionBackgroundNode;
