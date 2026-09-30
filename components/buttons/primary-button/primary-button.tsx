import { useRef } from "react";

/**
 * The filled call-to-action, as a link OR a button depending on what it is for.
 *
 * It used to always render `<a href="#">` and `preventDefault` whatever it was
 * handed, which made every form submit in the product a link: announced as one
 * by a screen reader, unable to submit its form, and unreachable by pressing
 * Enter in a field. The element now follows the intent — an `href` means
 * navigation, an `onClick` without one means an action.
 */
export function PrimaryButton({
  children,
  href,
  onClick,
  className = "",
  target,
  inline = true,
  radius = "20px",
  size = "medium",
  disabled = false,
  type = "button",
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  target?: string;
  inline?: boolean;
  radius?: string;
  size?: "small" | "medium";
  disabled?: boolean;
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
      circleRef.current.style.left = `-9999px`;
      circleRef.current.style.top = `-9999px`;
      circleRef.current.style.opacity = "0";
    }
  };

  const classes = `btn bg-white rounded text-black font-bold hover:cursor-pointer
          ${
            size === "medium"
              ? "pt-5 pb-5 pl-5 pr-5 sm:text-base text-[0.95rem] "
              : "pt-4 pb-4 pl-4 pr-4 sm:text-[15px] text-[0.90rem]"
          } appearance-none isolate inset-0 overflow-hidden relative
          hover:scale-[0.98] transition-transform duration-100 active:scale-[0.95]
         ${className} ${
           disabled
             ? "opacity-50 cursor-not-allowed pointer-events-none scale-[0.95]"
             : ""
         }`;

  const content = (
    <>
      <span>{children}</span>
      <span
        ref={circleRef}
        className="absolute rounded-full pointer-events-none w-20 h-20
            bg-[var(--primary-color)] z-10
            transform -translate-x-1/2 -translate-y-1/2
            filter blur-lg mix-blend-lighten
            top-[-9999px] left-[-9999px] opacity-0 transition-opacity duration-300"
      />
    </>
  );

  // Safari stops honouring an `overflow: hidden` + `border-radius` clip on
  // composited children (the blurred, blended glow) while the element is being
  // scaled, so for the length of the hover transition the glow escaped the
  // rounded corners and showed as a red rectangle cut by the square wrapper.
  // `isolate` keeps the button's own clip in place; the wrapper carries the
  // same radius so a failed clip still cannot draw a square. The radius is
  // inline because Tailwind cannot generate `rounded-[${radius}]` from a
  // template literal.
  const radiusStyle = { borderRadius: radius };

  return (
    <div
      className={`relative overflow-hidden ${inline ? "inline-flex" : "flex"}`}
      style={radiusStyle}
    >
      {href ? (
        <a
          href={href}
          className={classes}
          style={radiusStyle}
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
          style={radiusStyle}
          onClick={onClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          disabled={disabled}
          aria-label={ariaLabel}
        >
          {content}
        </button>
      )}
    </div>
  );
}
