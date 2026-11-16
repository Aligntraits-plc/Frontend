/*
  Cover art for workshop courses. Drawn here so the pictures ship with the site
  (nothing is loaded from elsewhere) and stay light on data.
*/
const INK = "#1B2B4B";
const CREAM = "#F6EEDC";
const PAPER = "#FFFDF7";
const GOLD = "#F6C648";
const NAVY = "#12284C";
const BLUE = "#8FB8E8";

const Notebook = ({ x = 60, y = 34 }: { x?: number; y?: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="0" y="0" width="188" height="120" rx="6" fill={PAPER} stroke={INK} strokeWidth="3" />
    <line x1="94" y1="2" x2="94" y2="118" stroke={INK} strokeWidth="3" />
  </g>
);
const Pencil = ({ x, y, r = -40 }: { x: number; y: number; r?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x="0" y="-5" width="78" height="10" rx="2" fill={GOLD} stroke={INK} strokeWidth="2" />
    <path d="M78 -5 L92 0 L78 5 Z" fill="#F2D9B0" stroke={INK} strokeWidth="2" />
    <path d="M88 -1.500 L92 0 L88 1.500 Z" fill={INK} />
  </g>
);

function Art({ kind }: { kind: string }) {
  switch (kind) {
    case "english":
      return (
        <>
          <rect width="320" height="180" fill={NAVY} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={28} y={34 + i * 30} width={96 - (i % 2) * 14} height="22" rx="3" fill={[BLUE, GOLD, "#E9EEF6", "#5C86C2"][i]} stroke="#0B1A33" strokeWidth="2" />
          ))}
          <g transform="translate(150 28)">
            <rect width="142" height="124" rx="6" fill={PAPER} stroke="#0B1A33" strokeWidth="3" />
            <line x1="71" y1="2" x2="71" y2="122" stroke="#0B1A33" strokeWidth="2" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x="12" y={16 + i * 16} width={i === 2 ? 30 : 46} height="6" rx="3" fill={i === 2 ? GOLD : "#C9D3E3"} />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x="84" y={16 + i * 16} width={i === 4 ? 28 : 44} height="6" rx="3" fill={i === 1 ? GOLD : "#C9D3E3"} />
            ))}
          </g>
        </>
      );
    case "physics":
      return (
        <>
          <rect width="320" height="180" fill={CREAM} />
          <Notebook />
          <g fill="none" stroke={INK} strokeWidth="2.5">
            <path d="M76 120 Q104 40 142 120" />
            <line x1="76" y1="120" x2="146" y2="120" />
            <circle cx="198" cy="88" r="26" />
            <ellipse cx="198" cy="88" rx="26" ry="9" />
            <ellipse cx="198" cy="88" rx="9" ry="26" />
          </g>
          <circle cx="109" cy="80" r="6" fill={GOLD} stroke={INK} strokeWidth="2" />
          <circle cx="198" cy="88" r="5" fill={GOLD} stroke={INK} strokeWidth="2" />
          <Pencil x={236} y={150} />
        </>
      );
    case "choice":
      return (
        <>
          <rect width="320" height="180" fill="#E6EEF7" />
          <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round">
            <path d="M160 160 V104" />
            <path d="M160 104 C160 74 110 78 96 50" />
            <path d="M160 104 C160 74 210 78 224 50" />
            <path d="M160 104 V44" />
          </g>
          {[
            [96, 40, BLUE],
            [160, 32, GOLD],
            [224, 40, "#33C27F"],
          ].map(([cx, cy, fill]) => (
            <circle key={String(cx)} cx={cx as number} cy={cy as number} r="16" fill={fill as string} stroke={INK} strokeWidth="3" />
          ))}
          <rect x="140" y="150" width="40" height="14" rx="4" fill={PAPER} stroke={INK} strokeWidth="3" />
        </>
      );
    case "study":
      return (
        <>
          <rect width="320" height="180" fill={CREAM} />
          <g transform="translate(66 26)">
            <rect width="188" height="132" rx="8" fill={PAPER} stroke={INK} strokeWidth="3" />
            <rect width="188" height="26" rx="8" fill={NAVY} />
            {[0, 1, 2, 3, 4, 5, 6].map((c) => [0, 1, 2].map((r) => <rect key={`${c}-${r}`} x={12 + c * 24} y={40 + r * 28} width="18" height="18" rx="4" fill={(c + r) % 4 === 0 ? GOLD : (c * 2 + r) % 5 === 0 ? BLUE : "#E9EEF6"} stroke={INK} strokeWidth="1.5" />))}
          </g>
          <Pencil x={232} y={160} r={-34} />
        </>
      );
    case "apply":
      return (
        <>
          <rect width="320" height="180" fill={NAVY} />
          <g transform="translate(92 22)">
            <rect width="136" height="140" rx="8" fill={PAPER} stroke="#0B1A33" strokeWidth="3" />
            <rect x="44" y="-8" width="48" height="18" rx="6" fill={GOLD} stroke="#0B1A33" strokeWidth="3" />
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(16 ${28 + i * 27})`}>
                <rect width="16" height="16" rx="4" fill={i < 3 ? "#33C27F" : "#E9EEF6"} stroke="#0B1A33" strokeWidth="2" />
                {i < 3 && <path d="M4 8.500 L7 11.500 L12.500 5" fill="none" stroke="#fff" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" />}
                <rect x="26" y="5" width={i === 1 ? 62 : 78} height="6" rx="3" fill="#C9D3E3" />
              </g>
            ))}
          </g>
        </>
      );
    default: // maths
      return (
        <>
          <rect width="320" height="180" fill={CREAM} />
          <Notebook x={36} />
          <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
            <path d="M56 130 L82 62 L118 130 Z" />
            <circle cx="88" cy="112" r="20" />
            <path d="M146 128 L206 128 L206 78 Z" fill={GOLD} />
            <path d="M152 70 l18 -14 l22 6 l6 20 l-20 10 l-24 -6 Z" fill={GOLD} />
          </g>
          <g transform="translate(240 40) rotate(8)">
            <rect width="52" height="74" rx="7" fill={NAVY} stroke={INK} strokeWidth="2.5" />
            <rect x="7" y="8" width="38" height="14" rx="3" fill={BLUE} />
            {[0, 1, 2].map((c) => [0, 1, 2].map((r) => <rect key={`${c}-${r}`} x={8 + c * 13} y={30 + r * 13} width="9" height="9" rx="2" fill="#E9EEF6" />))}
          </g>
          <Pencil x={214} y={164} />
        </>
      );
  }
}

export default function WorkshopCover({ kind, className }: { kind: string; className?: string }) {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <Art kind={kind} />
    </svg>
  );
}
