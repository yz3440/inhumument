import { create } from 'zustand';
import {
  loadFavorites,
  toggleFavorite as toggleFavoriteStorage,
  type FavoriteRef,
} from '@/lib/favorites';

export interface ConsoleEntry {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  line?: number;
  ts: number;
}

export type DockTab = 'pages' | 'sketches' | 'api';
export type PreviewTab = 'preview' | 'select';

export interface SketchState {
  dbReady: boolean;
  page: number;
  /** Content page numbers, ascending. Prefetched once so labels can stay sync. */
  pageList: number[];
  sketch: string;
  consoleEntries: ConsoleEntry[];
  reloadKey: number;

  dockOpen: boolean;
  dockTab: DockTab;
  consoleOpen: boolean;
  liveRun: boolean;

  /** 'fit' = auto-scale to fit pane; 'manual' = use viewZoom directly. */
  viewMode: 'fit' | 'manual';
  /** Manual scale factor (1 = 100%). */
  viewZoom: number;
  /** Whatever scale the iframe actually applied (reported back). Display only. */
  actualZoom: number;

  /** Which tab is active in the preview pane (sketch preview vs word selector). */
  previewTab: PreviewTab;

  /** Independent zoom state for the Select tab — selecting words wants a
   *  different scale than viewing the rendered sketch. */
  selectViewMode: 'fit' | 'manual';
  selectViewZoom: number;
  selectActualZoom: number;

  /** User-favorited pages. Persisted to localStorage. */
  favorites: FavoriteRef[];

  /** Word IDs in the current pending group (the user's "active" selection). */
  pendingIds: number[];
  /** Saved groups, each a list of word IDs. Does NOT include pendingIds. */
  groupsIds: number[][];
  /** Bumps on every selection change so the iframe + Preview can react. */
  selectionVersion: number;

  setDbReady: (v: boolean) => void;
  setPage: (page: number) => void;
  setPageList: (p: number[]) => void;
  setSketch: (s: string) => void;
  appendConsole: (e: Omit<ConsoleEntry, 'ts'>) => void;
  clearConsole: () => void;
  bumpReload: () => void;

  toggleDock: () => void;
  setDockTab: (t: DockTab) => void;
  toggleConsole: () => void;
  setLiveRun: (v: boolean) => void;

  setViewFit: () => void;
  setViewZoom: (z: number) => void;
  setActualZoom: (z: number) => void;

  setPreviewTab: (t: PreviewTab) => void;
  setSelectViewFit: () => void;
  setSelectViewZoom: (z: number) => void;
  setSelectActualZoom: (z: number) => void;

  toggleWord: (id: number) => void;
  commitGroup: () => void;
  clearSelection: () => void;

  toggleFavorite: (page: number) => void;
}

export const useSketchStore = create<SketchState>((set) => ({
  dbReady: false,
  page: 33,
  pageList: [],
  sketch: '',
  consoleEntries: [],
  reloadKey: 0,

  dockOpen: true,
  dockTab: 'pages',
  consoleOpen: true,
  liveRun: false,

  viewMode: 'fit',
  viewZoom: 1,
  actualZoom: 1,

  previewTab: 'preview',
  selectViewMode: 'fit',
  selectViewZoom: 1,
  selectActualZoom: 1,

  favorites: loadFavorites(),

  pendingIds: [],
  groupsIds: [],
  selectionVersion: 0,

  setDbReady: (v) => set({ dbReady: v }),
  setPage: (page) =>
    set((s) => ({
      page,
      consoleEntries: [],
      pendingIds: [],
      groupsIds: [],
      selectionVersion: s.selectionVersion + 1,
      // Each new page starts auto-fit in the Select tab so a tall page
      // doesn't leave you stranded at the top.
      selectViewMode: 'fit',
    })),
  setPageList: (pageList) => set({ pageList }),
  setSketch: (sketch) => set({ sketch }),
  appendConsole: (e) =>
    set((s) => ({
      consoleEntries: [...s.consoleEntries, { ...e, ts: Date.now() }].slice(-200),
    })),
  clearConsole: () => set({ consoleEntries: [] }),
  bumpReload: () => set((s) => ({ reloadKey: s.reloadKey + 1 })),

  toggleDock: () => set((s) => ({ dockOpen: !s.dockOpen })),
  setDockTab: (dockTab) => set({ dockTab, dockOpen: true }),
  toggleConsole: () => set((s) => ({ consoleOpen: !s.consoleOpen })),
  setLiveRun: (v) => set({ liveRun: v }),

  setViewFit: () => set({ viewMode: 'fit' }),
  setViewZoom: (z) => set({ viewMode: 'manual', viewZoom: clampZoom(z) }),
  setActualZoom: (actualZoom) => set({ actualZoom }),

  setPreviewTab: (previewTab) => set({ previewTab }),
  setSelectViewFit: () => set({ selectViewMode: 'fit' }),
  setSelectViewZoom: (z) => set({ selectViewMode: 'manual', selectViewZoom: clampZoom(z) }),
  setSelectActualZoom: (selectActualZoom) => set({ selectActualZoom }),

  toggleWord: (id) =>
    set((s) => {
      const i = s.pendingIds.indexOf(id);
      const pendingIds =
        i >= 0
          ? [...s.pendingIds.slice(0, i), ...s.pendingIds.slice(i + 1)]
          : [...s.pendingIds, id];
      return { pendingIds, selectionVersion: s.selectionVersion + 1 };
    }),
  commitGroup: () =>
    set((s) => {
      if (s.pendingIds.length === 0) return s;
      return {
        pendingIds: [],
        groupsIds: [...s.groupsIds, s.pendingIds],
        selectionVersion: s.selectionVersion + 1,
      };
    }),
  clearSelection: () =>
    set((s) => {
      if (s.pendingIds.length === 0 && s.groupsIds.length === 0) return s;
      return {
        pendingIds: [],
        groupsIds: [],
        selectionVersion: s.selectionVersion + 1,
      };
    }),

  toggleFavorite: (page) =>
    set({ favorites: toggleFavoriteStorage(page) }),
}));

function clampZoom(z: number): number {
  if (!Number.isFinite(z)) return 1;
  return Math.max(0.05, Math.min(8, z));
}
