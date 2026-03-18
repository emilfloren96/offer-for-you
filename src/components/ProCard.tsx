import { type Professional, SERVICE_CATEGORIES } from '../data/marketplace';

interface ProCardProps {
  pro: Professional;
  highlighted?: boolean; // true when this pro matches the homeowner's selected category
  onContact: (pro: Professional) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`Betyg: ${rating} av 5`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#004494' : score >= 75 ? '#27ae60' : '#e67e22';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        aria-hidden="true"
        style={{
          flex: 1,
          height: 5,
          borderRadius: 99,
          backgroundColor: '#e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>
        {score}
      </span>
    </div>
  );
}

export function ProCard({ pro, highlighted, onContact }: ProCardProps) {
  const catLabels = pro.categories
    .map((c) => SERVICE_CATEGORIES.find((sc) => sc.id === c)?.label)
    .filter(Boolean) as string[];

  return (
    <article
      style={{
        backgroundColor: '#fff',
        border: highlighted ? '2px solid var(--primary-blue)' : '1px solid #e5e7eb',
        borderRadius: 'var(--border-radius)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        boxShadow: highlighted ? '0 4px 20px rgba(0,68,148,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Premium banner */}
      {pro.premium && (
        <div
          aria-label="Premium Partner"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 99,
            border: '1px solid #fcd34d',
          }}
        >
          Premium Partner
        </div>
      )}

      {/* Header: avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: pro.premium ? 110 : 0 }}>
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: pro.avatarColor,
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {pro.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pro.name}
            </span>
            {pro.verified && (
              <svg aria-label="Verifierad" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#004494" />
                <path d="M7 12l3.5 3.5L17 8.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{pro.company}</div>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {catLabels.map((label) => (
          <span
            key={label}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 99,
              backgroundColor: '#e8f0fb',
              color: 'var(--primary-blue)',
            }}
          >
            {label}
          </span>
        ))}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 99,
            backgroundColor: '#f3f4f6',
            color: '#4b5563',
          }}
        >
          {pro.region}
        </span>
      </div>

      {/* Bio */}
      <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
        {pro.bio}
      </p>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <StarRating rating={pro.rating} />
          <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>
            {pro.rating} ({pro.reviewCount} omdömen)
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{pro.completedJobs}</div>
          <div style={{ fontSize: 11, color: '#4b5563' }}>avslutade jobb</div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{pro.responseTime}</div>
          <div style={{ fontSize: 11, color: '#4b5563' }}>svarstid</div>
        </div>
      </div>

      {/* Energybrand score */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#4b5563', marginBottom: 5 }}>
          Energybrand Score
        </div>
        <ScoreBar score={pro.score} />
      </div>

      {/* Contact button */}
      <button
        onClick={() => onContact(pro)}
        style={{
          backgroundColor: highlighted ? 'var(--primary-blue)' : 'transparent',
          color: highlighted ? '#fff' : 'var(--primary-blue)',
          border: '2px solid var(--primary-blue)',
          borderRadius: 'var(--border-radius)',
          padding: '9px 0',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          width: '100%',
        }}
      >
        Kontakta {pro.name.split(' ')[0]}
      </button>
    </article>
  );
}
