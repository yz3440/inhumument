import type { ReactNode } from 'react';
import type { DocsSectionId } from '@/docs/DocsLayout';

export function SectionHeading({
  id,
  title,
  description,
}: {
  id: DocsSectionId;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6 scroll-mt-24" id={id}>
      <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h2>
      {description ? (
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">{description}</p>
      ) : null}
    </header>
  );
}

export function Subheading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="mb-3 mt-8 scroll-mt-24 text-[15px] font-semibold tracking-tight text-foreground first:mt-0"
    >
      {children}
    </h3>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">{children}</p>;
}
