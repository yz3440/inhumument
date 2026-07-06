import { useSketchStore, type DockTab } from '@/hooks/useSketchStore';
import { Tabs, tabsClasses } from '@/components/ui/tabs';
import { PagesTab } from './dock-tabs/PagesTab';
import { SketchesTab } from './dock-tabs/SketchesTab';
import { ApiTab } from './dock-tabs/ApiTab';

export function Dock() {
  const dockTab = useSketchStore((s) => s.dockTab);
  const setDockTab = useSketchStore((s) => s.setDockTab);

  return (
    <div className="flex h-full flex-col bg-card">
      <Tabs.Root
        value={dockTab}
        onValueChange={(v) => setDockTab(v as DockTab)}
        className="flex h-full flex-col"
      >
        <Tabs.List className={tabsClasses.list}>
          <Tabs.Trigger value="pages" className={tabsClasses.trigger}>Pages</Tabs.Trigger>
          <Tabs.Trigger value="sketches" className={tabsClasses.trigger}>Sketches</Tabs.Trigger>
          <Tabs.Trigger value="api" className={tabsClasses.trigger}>API</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="pages" className={tabsClasses.content}>
          <PagesTab />
        </Tabs.Content>
        <Tabs.Content value="sketches" className={tabsClasses.content}>
          <SketchesTab />
        </Tabs.Content>
        <Tabs.Content value="api" className={tabsClasses.content}>
          <ApiTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
