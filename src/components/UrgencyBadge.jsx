// UrgencyBadge.jsx — color-coded urgency indicator using Stitch M3-adjacent colors
export default function UrgencyBadge({ urgency }) {
  const map = {
    high:   { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
    medium: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
    low:    { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  };
  const style = map[urgency?.toLowerCase()] ?? map.low;
  const label = urgency ? urgency.charAt(0).toUpperCase() + urgency.slice(1) : 'Low';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-sm border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}
