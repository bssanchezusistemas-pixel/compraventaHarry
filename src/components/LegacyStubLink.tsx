"use client";

type LegacyStubLinkProps = {
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
};

export default function LegacyStubLink({
  className,
  "aria-label": ariaLabel,
  children,
}: LegacyStubLinkProps) {
  return (
    <a
      href="#"
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </a>
  );
}
