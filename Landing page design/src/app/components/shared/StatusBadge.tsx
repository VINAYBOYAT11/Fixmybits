// ─── StatusBadge ─────────────────────────────────────────────────────────────
// Color-coded pill badge for project/report statuses matching the site theme.

type Props = { status: string; size?: 'sm' | 'md' };

const PROJECT_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  draft:            { label: 'Draft',           bg: '#6b7280', text: 'white' },
  pending_approval: { label: 'Pending Approval', bg: 'var(--accent-yellow)', text: '#1a1a1a' },
  open:             { label: 'Open',             bg: 'var(--accent-mint)',   text: '#1a1a1a' },
  in_progress:      { label: 'In Progress',      bg: '#3b82f6',              text: 'white' },
  completed:        { label: 'Completed',        bg: '#22c55e',              text: 'white' },
  rejected:         { label: 'Rejected',         bg: '#ef4444',              text: 'white' },
};

const REPORT_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  pending_admin_review: { label: 'Pending Review', bg: 'var(--accent-yellow)', text: '#1a1a1a' },
  approved:             { label: 'Approved',       bg: '#22c55e',              text: 'white' },
  spam:                 { label: 'Spam',           bg: '#6b7280',              text: 'white' },
  duplicate:            { label: 'Duplicate',      bg: '#a855f7',              text: 'white' },
  fixed:                { label: 'Fixed',          bg: 'var(--accent-mint)',   text: '#1a1a1a' },
};

const SEVERITY: Record<string, { bg: string; text: string }> = {
  Low:      { bg: '#22c55e', text: 'white' },
  Medium:   { bg: 'var(--accent-yellow)', text: '#1a1a1a' },
  High:     { bg: '#f97316', text: 'white' },
  Critical: { bg: '#ef4444', text: 'white' },
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const config = PROJECT_STATUS[status] ?? REPORT_STATUS[status];
  if (!config) return <span className="opacity-60 text-xs">{status}</span>;
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-block rounded-full font-semibold border border-black/20 ${px}`}
      style={{ background: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

export function SeverityBadge({ severity, size = 'md' }: { severity: string; size?: 'sm' | 'md' }) {
  const config = SEVERITY[severity] ?? { bg: '#6b7280', text: 'white' };
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-block rounded-full font-semibold border border-black/20 ${px}`}
      style={{ background: config.bg, color: config.text }}
    >
      {severity}
    </span>
  );
}
