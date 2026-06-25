type Props = {
  children: React.ReactNode;
  tone?: 'blue' | 'green' | 'rose' | 'amber' | 'slate';
};

const tones = {
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  slate: 'border-white/10 bg-white/5 text-slate-200'
};

export default function Badge({ children, tone = 'slate' }: Props) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
