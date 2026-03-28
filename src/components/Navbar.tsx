import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-display text-sm px-3 py-2 transition-colors border-b-2 ${
      isActive
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-display font-bold text-foreground text-lg">ClaudeBoost</span>
        </div>
        <div className="flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            History
          </NavLink>
          <NavLink to="/stats" className={linkClass}>
            Stats
          </NavLink>
          <NavLink to="/constraints" className={linkClass}>
            Constraints
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
