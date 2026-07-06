export function TypeSignature({ children }: { children: string }) {
  return (
    <pre className="mb-2 whitespace-pre-wrap border-l-2 border-border pl-3 font-mono text-[12px] leading-snug text-foreground">
      {children}
    </pre>
  );
}
