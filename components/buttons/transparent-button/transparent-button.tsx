import { useRef } from "react";

/**
 * The secondary call-to-action. Same rule as `PrimaryButton`: an `href` means
 * navigation and renders an anchor, an `onClick` without one means an action
 * and renders a real button.
 */
export function TransparentButton({
  children,
  href,
  onClick,
  className = "",
  target,
  inline = true,
  size = "medium",
  type = "button",
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  target?: string;
  inline?: boolean;
  size?: "small" | "medium";
  /** Only meaningful without an `href`; lets a form submit natively. */
  type?: "button" | "submit";
  "aria-label"?: string;
}) {
  const circleRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (circleRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      circleRef.current.style.left = `${e.clientX - rect.left}px`;
      circleRef.current.style.top = `${e.clientY - rect.top}px`;
      circleRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    if (circleRef.current) {
      circleRef.current.style.opacity = "0";
    }
  };

  const classes = `btn bg-secondary rounded text-white font-bold
          ${
            size === "medium"
              ? "pt-5 pb-5 pl-5 pr-5 sm:text-base text-[0.95rem] "
              : "pt-4 pb-4 pl-4 pr-4 sm:text-[15px] text-[0.90rem]"
          } rounded-[20px] inset-0 overflow-hidden relative
          hover:scale-[0.98] transition-transform duration-100
          active:scale-[0.95] sm:text-base text-[0.95rem]
         ${className}`;

  const content = (
    <>
      <span className="flex items-center">{children}</span>
      <span
        ref={circleRef}
        className="absolute rounded-full pointer-events-none w-5 h-5
            bg-[var(--primary-color)] z-10
            transform -translate-x-1/2 -translate-y-1/2
            filter blur-lg mix-blend-lighten
            opacity-0 transition-opacity duration-300"
      />
    </>
  );

  return (
    <div
      className={`relative ${inline ? "inline-flex" : "flex"} overflow-hidden`}
    >
      {href ? (
        <a
          href={href}
          className={classes}
          onClick={onClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          target={target}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      ) : (
        <button
          type={type}
          className={classes}
          onClick={onClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-label={ariaLabel}
        >
          {content}
        </button>
      )}
    </div>
  );
}
