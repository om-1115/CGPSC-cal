export interface ToastItem {
  id: number;
  msg: string;
}

export function Toast({ items }: { items: ToastItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast-item">{t.msg}</div>
      ))}
    </div>
  );
}
