type HeaderProps = {
  streak: number;
};

const XP_PER_COMMIT = 42;

export function Header({ streak }: HeaderProps) {
  return (
    <header className="topbar">
      <h1 className="logo">
        CHEWIE<span className="logo-dot">.</span>dev
      </h1>
      <div className="stats">
        <span className="pill">
          🔥 streak: <strong>{streak}</strong> commits
        </span>
        <span className="pill">
          ⚡ xp: <strong className="xp">{streak * XP_PER_COMMIT}</strong>
        </span>
      </div>
    </header>
  );
}
