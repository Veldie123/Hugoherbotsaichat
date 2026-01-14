export const getCodeBadgeColors = (code: string) => {
  const fase = code.split('.')[0];
  switch (fase) {
    case '0': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    case '1': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case '2': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case '3': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case '4': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    default: return 'bg-hh-ink/10 text-hh-ink border-hh-ink/20';
  }
};

export const getFaseBadgeColors = (fase: string) => {
  switch (fase) {
    case '0': return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    case '1': return { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' };
    case '2': return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
    case '3': return { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' };
    case '4': return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' };
    default: return { bg: 'bg-hh-ui-100', text: 'text-hh-ink', border: 'border-hh-border' };
  }
};
