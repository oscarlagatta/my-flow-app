import { CheckCircle2, XCircle } from 'lucide-react';

interface StatusIconProps {
  status: '✅' | '❌';
}

export default function StatusIcon({ status }: StatusIconProps) {
  if (status === '✅') {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />;
  }
  return <XCircle className="mx-auto h-5 w-5 text-red-500" />;
}
