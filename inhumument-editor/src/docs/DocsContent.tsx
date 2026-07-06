import { Overview } from '@/docs/sections/Overview';
import { GettingStarted } from '@/docs/sections/GettingStarted';
import { ApiReference } from '@/docs/sections/ApiReference';
import { TypesReference } from '@/docs/sections/TypesReference';

export function DocsContent() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 pb-16 md:px-8">
      <Overview />
      <GettingStarted />
      <ApiReference />
      <TypesReference />
    </article>
  );
}
