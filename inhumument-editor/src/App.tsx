import { useEffect } from 'react';
import { Humument } from 'inhumument-lib';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useSketchStore } from '@/hooks/useSketchStore';
import { TopBar } from '@/components/TopBar';
import { Dock } from '@/components/Dock';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Console } from '@/components/Console';
import { Toaster } from '@/components/ui/sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { loadSketch, saveSketch } from '@/lib/persist';
import { loadFavorites } from '@/lib/favorites';
import { setPageList as setLabelPages } from '@/lib/page-label';
import { defaultSketch } from '@/starter-sketches';

const HANDLE_CLASS = [
  'relative bg-transparent transition-colors',
  'w-px data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full',
  'hover:bg-border focus-visible:bg-border',
  'after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2',
  'data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:h-2 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0',
  'focus-visible:outline-none',
].join(' ');

const PANEL_GROUP_CLASS = 'flex h-full w-full data-[panel-group-direction=vertical]:flex-col';

export function App() {
  const dbReady = useSketchStore((s) => s.dbReady);
  const setDbReady = useSketchStore((s) => s.setDbReady);
  const page = useSketchStore((s) => s.page);
  const pageList = useSketchStore((s) => s.pageList);
  const sketch = useSketchStore((s) => s.sketch);
  const setSketch = useSketchStore((s) => s.setSketch);
  const setPage = useSketchStore((s) => s.setPage);
  const setPageList = useSketchStore((s) => s.setPageList);
  const bumpReload = useSketchStore((s) => s.bumpReload);

  const dockOpen = useSketchStore((s) => s.dockOpen);
  const toggleDock = useSketchStore((s) => s.toggleDock);
  const consoleOpen = useSketchStore((s) => s.consoleOpen);
  const toggleConsole = useSketchStore((s) => s.toggleConsole);
  const commitGroup = useSketchStore((s) => s.commitGroup);
  const clearSelection = useSketchStore((s) => s.clearSelection);
  const toggleFavorite = useSketchStore((s) => s.toggleFavorite);
  const setFavorites = useSketchStore((s) => s.setFavorites);

  useEffect(() => {
    (async () => {
      try {
        setFavorites(await loadFavorites());
        await Humument.init();
        const pages = await Humument.catalog.listPages();
        setPageList(pages);
        setLabelPages(pages);
        setDbReady(true);
      } catch (e) {
        console.error('DB init failed:', e);
      }
    })();
  }, [setDbReady, setPageList, setFavorites]);

  useEffect(() => {
    let stale = false;
    loadSketch(page).then((saved) => {
      if (!stale) setSketch(saved ?? defaultSketch);
    });
    return () => {
      stale = true;
    };
  }, [page, setSketch]);

  // Cmd+/ deliberately NOT bound here so CodeMirror's toggleLineComment keeps
  // working in the editor; same for Cmd+D / Cmd+F.
  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    void saveSketch(page, sketch);
  }, { enableOnContentEditable: true, enableOnFormTags: true }, [page, sketch]);

  useHotkeys('mod+enter', (e) => {
    e.preventDefault();
    bumpReload();
  }, { enableOnContentEditable: true, enableOnFormTags: true }, [bumpReload]);

  useHotkeys('mod+b', (e) => {
    e.preventDefault();
    toggleDock();
  }, { enableOnContentEditable: true, enableOnFormTags: true }, [toggleDock]);

  useHotkeys('mod+j', (e) => {
    e.preventDefault();
    toggleConsole();
  }, { enableOnContentEditable: true, enableOnFormTags: true }, [toggleConsole]);

  useHotkeys('[', () => {
    if (!dbReady) return;
    const i = pageList.indexOf(page);
    if (i > 0) setPage(pageList[i - 1]);
  }, [dbReady, pageList, page, setPage]);
  useHotkeys(']', () => {
    if (!dbReady) return;
    const i = pageList.indexOf(page);
    if (i >= 0 && i < pageList.length - 1) setPage(pageList[i + 1]);
  }, [dbReady, pageList, page, setPage]);

  // Selection hotkeys: g commits the pending group, Escape clears all
  // selections. Both stay out of CodeMirror / form fields by default so
  // they don't collide with editing.
  useHotkeys('g', () => commitGroup(), [commitGroup]);
  useHotkeys('escape', () => clearSelection(), [clearSelection]);

  // f toggles favorite on the current page. Stays out of CodeMirror so it
  // doesn't fight letter-input.
  useHotkeys('f', () => toggleFavorite(page), [toggleFavorite, page]);

  if (!dbReady) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[13px] text-muted-foreground">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
        <span>Loading database…</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar />
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className={PANEL_GROUP_CLASS}>
          {dockOpen && (
            <>
              <Panel defaultSize={20} minSize={14} maxSize={36}>
                <Dock />
              </Panel>
              <PanelResizeHandle className={HANDLE_CLASS} />
            </>
          )}
          <Panel defaultSize={dockOpen ? 80 : 100}>
            <PanelGroup direction="vertical" className={PANEL_GROUP_CLASS}>
              <Panel defaultSize={consoleOpen ? 70 : 100} minSize={20}>
                <PanelGroup direction="horizontal" className={PANEL_GROUP_CLASS}>
                  <Panel defaultSize={42} minSize={20}>
                    <Editor />
                  </Panel>
                  <PanelResizeHandle className={HANDLE_CLASS} />
                  <Panel defaultSize={58}>
                    <Preview />
                  </Panel>
                </PanelGroup>
              </Panel>
              {consoleOpen && (
                <>
                  <PanelResizeHandle className={HANDLE_CLASS} />
                  <Panel defaultSize={30} minSize={10}>
                    <Console />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
      <Toaster />
    </div>
  );
}
