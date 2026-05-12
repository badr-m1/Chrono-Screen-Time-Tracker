function Button({ children, onClick, variant = "default" }) {
  return (
    <button
      onClick={onClick}
      className={`
        font-mono text-[11px] tracking-wider uppercase
        px-4 py-2 rounded-sm
        border transition-colors duration-200
        ${variant === "accent"
          ? "border-accent text-accent hover:bg-accent hover:text-accent-content"
          : "border-base-content/15 text-base-content-muted hover:border-accent hover:text-accent"
        }
      `}
    >
      {children} 
    </button>
  );
}

export default Button