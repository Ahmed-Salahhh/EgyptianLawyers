import { ReactNode } from "react";

type LtrTextProps = {
  children: ReactNode;
  className?: string;
};

export function LtrText({ children, className = "" }: LtrTextProps) {
  return (
    <span dir="ltr" className={`inline-block [unicode-bidi:isolate] ${className}`}>
      {children}
    </span>
  );
}
