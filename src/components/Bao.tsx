// Panda mascot (illustration, not emoji). Mood changes the face.
type Mood = "happy" | "sad" | "sleepy";

export function Bao({ mood = "happy", size = 140, className = "" }: { mood?: Mood; size?: number; className?: string }) {
  const eye = mood === "sleepy" ? (
    <>
      <path d="M72 100 q10 8 20 0" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M108 100 q10 8 20 0" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ) : (
    <>
      <circle cx="82" cy="98" r="5" fill="#fff" />
      <circle cx="118" cy="98" r="5" fill="#fff" />
    </>
  );
  const mouth =
    mood === "sad" ? <path d="M90 128 q10 -9 20 0" stroke="#23324a" strokeWidth="4" fill="none" strokeLinecap="round" />
    : <path d="M88 122 q12 14 24 0" stroke="#23324a" strokeWidth="4" fill="none" strokeLinecap="round" />;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label="Bao the panda">
      <circle cx="52" cy="52" r="26" fill="#2b2b3a" />
      <circle cx="148" cy="52" r="26" fill="#2b2b3a" />
      <ellipse cx="100" cy="112" rx="78" ry="70" fill="#fff" stroke="#cfe3d6" strokeWidth="3" />
      <ellipse cx="76" cy="100" rx="19" ry="23" fill="#2b2b3a" transform="rotate(-18 76 100)" />
      <ellipse cx="124" cy="100" rx="19" ry="23" fill="#2b2b3a" transform="rotate(18 124 100)" />
      {eye}
      <ellipse cx="100" cy="116" rx="11" ry="8" fill="#2b2b3a" />
      {mouth}
      <ellipse cx="58" cy="128" rx="9" ry="6" fill="#ffb3c6" opacity=".7" />
      <ellipse cx="142" cy="128" rx="9" ry="6" fill="#ffb3c6" opacity=".7" />
    </svg>
  );
}
