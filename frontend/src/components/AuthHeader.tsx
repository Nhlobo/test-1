type Props = {
  title: string;
  subtitle: string;
};

export default function AuthHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
        <span className="text-xl font-bold">•</span>
      </div>
      <h2 className="text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">{subtitle}</p>
    </div>
  );
}
