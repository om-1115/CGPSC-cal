import type { Resource } from '../types';

interface Props {
  resource: Resource;
  onRemove: () => void;
  onTagClick: (tag: string) => void;
}

export function ResourceCard({ resource, onRemove, onTagClick }: Props) {
  const isPdf = resource.type === 'pdf';

  const meta = isPdf
    ? `PDF · ${new Date(resource.addedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
    : (() => {
        try { return new URL(resource.url ?? '').hostname.replace(/^www\./, ''); }
        catch { return resource.url ?? ''; }
      })();

  const titleNode = resource.url
    ? <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.name}</a>
    : <span>{resource.name}</span>;

  return (
    <div className="resource">
      <div className={`icon ${isPdf ? 'pdf' : 'link'}`}>
        {isPdf ? 'PDF' : '↗'}
      </div>
      <div className="resource-body">
        <div className="resource-name">
          {titleNode}
          {!isPdf && <span className="ext-arrow">↗</span>}
        </div>
        <div className="resource-meta">{meta}</div>
        {(resource.tags ?? []).length > 0 && (
          <div className="resource-tags">
            {(resource.tags ?? []).map((t) => (
              <button
                key={t}
                className="chip small accent"
                onClick={() => onTagClick(t)}
                title={t}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="remove" aria-label="Remove resource" onClick={onRemove}>×</button>
    </div>
  );
}
