import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function CodeBlock({
  code,
  lang = 'javascript',
}: {
  code: string;
  lang?: 'javascript' | 'typescript' | 'bash' | 'json';
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const out = await codeToHtml(code.trimEnd(), {
          lang,
          theme: 'github-light',
        });
        if (!cancelled) setHtml(out);
      } catch {
        if (!cancelled) {
          setHtml(`<pre class="py-3 font-mono text-[12px]">${escapeHtml(code)}</pre>`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (!html) {
    return <div className="mb-4 h-24 animate-pulse bg-muted/40" aria-hidden />;
  }

  return (
    <div
      className="docs-code mb-4 overflow-x-auto border-y border-border [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:bg-transparent! [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-[12px] [&_pre]:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
