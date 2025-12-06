import { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
  visible?: boolean;
  className?: string;
  id?: string;
}

export default function Section({
  title,
  children,
  visible = true,
  className = "",
  id,
}: SectionProps) {
  if (!visible) return null;

  return (
    <section id={id} className={`w-full max-w-2xl mb-6 bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

