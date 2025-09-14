import { TransactionUsWiresSearchProvider } from '@/domains/payment-health/providers/us-wires/us-wires-transaction-search-provider';
import { FlowDiagramUsWires } from '@/domains/payment-health/components/flow/diagrams/flow-diagrams/flow-diagram-us-wires/flow-diagram-us-wires';

function UsWires() {
  return (
    <TransactionUsWiresSearchProvider>
      <div className="h-full w-full space-y-6 pt-0 pl-4 shadow-sm">
        <FlowDiagramUsWires />
      </div>
    </TransactionUsWiresSearchProvider>
  );
}

export default UsWires;
