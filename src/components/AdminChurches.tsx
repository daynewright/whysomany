import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Info, SearchIcon, X, XCircle } from 'lucide-react';
import { defaultChurches, type Church } from '../data/defaultChurches';
import { invalidateChurchCache } from '../lib/churchCache';

const ADMIN_AUTH_KEY = 'wsm_admin_authed';

function clearAdminSessionStorage() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}

function normalizeChurch(church: Church): Church {
  return {
    name: church.name.trim(),
    denomination: church.denomination.trim(),
    address: church.address.trim(),
  };
}

function isBlankChurch(church: Church): boolean {
  const normalized = normalizeChurch(church);
  return !normalized.name && !normalized.denomination && !normalized.address;
}

function collectDenominations(churches: Church[]): string[] {
  return Array.from(
    new Set(
      churches
        .map((church) => church.denomination.trim())
        .filter((denomination) => denomination.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function cloneChurches(list: Church[]): Church[] {
  return list.map((c) => ({ ...c }));
}

function churchesListsEqual(a: Church[], b: Church[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = normalizeChurch(a[i]);
    const y = normalizeChurch(b[i]);
    if (x.name !== y.name || x.denomination !== y.denomination || x.address !== y.address) return false;
  }
  return true;
}

type ToastKind = 'success' | 'error' | 'info';

type ToastItem = { id: number; message: string; kind: ToastKind };

function AdminToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))] pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'pointer-events-auto flex gap-3 items-start rounded-xl border px-4 py-3 text-sm shadow-lg',
            t.kind === 'success' &&
              'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-100',
            t.kind === 'error' &&
              'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100',
            t.kind === 'info' && 'border-border bg-card text-foreground',
          ]
            .filter(Boolean)
            .join(' ')}
          role={t.kind === 'error' ? 'alert' : 'status'}
        >
          {t.kind === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          ) : null}
          {t.kind === 'error' ? <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden /> : null}
          {t.kind === 'info' ? <Info className="h-4 w-4 shrink-0 mt-0.5 opacity-80" aria-hidden /> : null}
          <p className="flex-1 leading-snug pt-0.5">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 rounded-md p-1 text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D32]"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function AdminChurches() {
  const [password, setPassword] = useState('');
  const [churches, setChurches] = useState<Church[]>(() => cloneChurches(defaultChurches));
  const [baselineChurches, setBaselineChurches] = useState<Church[]>(() => cloneChurches(defaultChurches));
  const [denominationOptions, setDenominationOptions] = useState<string[]>(
    collectDenominations(defaultChurches),
  );
  const [newDenomination, setNewDenomination] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-4), { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveModalPassword, setSaveModalPassword] = useState('');
  const [pendingSaveChurches, setPendingSaveChurches] = useState<Church[] | null>(null);
  const saveModalPasswordRef = useRef<HTMLInputElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalPassword, setDeleteModalPassword] = useState('');
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [pendingDeleteLabel, setPendingDeleteLabel] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteModalPasswordRef = useRef<HTMLInputElement>(null);
  const [saveModalError, setSaveModalError] = useState<string | null>(null);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addChurchDraft, setAddChurchDraft] = useState<Church>({
    name: '',
    denomination: '',
    address: '',
  });
  const [addModalError, setAddModalError] = useState<string | null>(null);
  const addModalNameRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = useMemo(
    () => !churchesListsEqual(churches, baselineChurches),
    [churches, baselineChurches],
  );

  useEffect(() => {
    const authed = sessionStorage.getItem(ADMIN_AUTH_KEY) === '1';
    setIsAuthenticated(authed);
    setIsCheckingAuth(false);
  }, []);

  /** Sign out when leaving the admin page (home, another site, close tab). Skips reload so refresh stays logged in. */
  useEffect(() => {
    const onPageHide = (e: PageTransitionEvent) => {
      if (e.persisted) return;
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === 'reload') return;
      clearAdminSessionStorage();
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const response = await fetch('/api/churches');
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data?.churches) && data.churches.length > 0) {
          const loaded = cloneChurches(data.churches);
          setChurches(loaded);
          setBaselineChurches(cloneChurches(loaded));
          setDenominationOptions((prev) =>
            Array.from(new Set([...prev, ...collectDenominations(data.churches)])).sort((a, b) =>
              a.localeCompare(b),
            ),
          );
        }
      } catch {
        showToast('Using fallback list locally. Run with `vercel dev` to test API.', 'info');
      }
    };
    load();
  }, [isAuthenticated, showToast]);

  const updateChurch = (index: number, field: keyof Church, value: string) => {
    const next = [...churches];
    next[index] = { ...next[index], [field]: value };
    setChurches(next);
  };

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false);
    setAddChurchDraft({ name: '', denomination: '', address: '' });
    setAddModalError(null);
  }, []);

  const openAddModal = () => {
    if (saveModalOpen || deleteModalOpen) return;
    setAddChurchDraft({ name: '', denomination: '', address: '' });
    setAddModalError(null);
    setAddModalOpen(true);
  };

  const confirmAddChurch = () => {
    const normalized = normalizeChurch(addChurchDraft);
    if (!normalized.name || !normalized.denomination || !normalized.address) {
      setAddModalError('Name, denomination, and address are all required.');
      return;
    }
    setChurches([normalized, ...churches]);
    setDenominationOptions((prev) =>
      Array.from(new Set([...prev, normalized.denomination])).sort((a, b) => a.localeCompare(b)),
    );
    showToast('Church added to your list. Save when ready to publish.', 'success');
    closeAddModal();
  };

  const addDenominationOption = () => {
    const next = newDenomination.trim();
    if (!next) return;
    setDenominationOptions((prev) =>
      Array.from(new Set([...prev, next])).sort((a, b) => a.localeCompare(b)),
    );
    setNewDenomination('');
    showToast(`Added denomination option: ${next}`, 'success');
  };

  const removeChurch = (index: number) => {
    setChurches(churches.filter((_, i) => i !== index));
  };

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteModalPassword('');
    setPendingDeleteIndex(null);
    setPendingDeleteLabel('');
    setDeleteModalError(null);
  }, []);

  const openDeleteModal = (index: number) => {
    if (saveModalOpen || addModalOpen) return;
    const church = churches[index];
    const label = church?.name?.trim() || 'this church';
    setPendingDeleteIndex(index);
    setPendingDeleteLabel(label);
    setDeleteModalPassword('');
    setDeleteModalError(null);
    setDeleteModalOpen(true);
  };

  const moveChurch = (index: number, direction: 'up' | 'down') => {
    setChurches((prev) => {
      const next = [...prev];
      const j = direction === 'up' ? index - 1 : index + 1;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const closeSaveModal = useCallback(() => {
    setSaveModalOpen(false);
    setSaveModalPassword('');
    setPendingSaveChurches(null);
    setSaveModalError(null);
  }, []);

  const openSaveModal = () => {
    if (deleteModalOpen || addModalOpen) return;
    if (!hasUnsavedChanges) {
      showToast('No changes to save.', 'info');
      return;
    }
    const cleanedChurches = churches.map(normalizeChurch).filter((church) => !isBlankChurch(church));
    if (cleanedChurches.length === 0) {
      showToast('Add at least one church before saving.', 'error');
      return;
    }

    const incompleteChurch = cleanedChurches.find(
      (church) => !church.name || !church.denomination || !church.address,
    );
    if (incompleteChurch) {
      showToast('Each church must include name, denomination, and address.', 'error');
      return;
    }

    setPendingSaveChurches(cleanedChurches);
    setSaveModalPassword('');
    setSaveModalError(null);
    setSaveModalOpen(true);
  };

  useEffect(() => {
    if (!saveModalOpen) return;
    const id = requestAnimationFrame(() => saveModalPasswordRef.current?.focus());
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSaveModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [saveModalOpen, closeSaveModal]);

  useEffect(() => {
    if (!deleteModalOpen) return;
    const id = requestAnimationFrame(() => deleteModalPasswordRef.current?.focus());
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDeleteModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [deleteModalOpen, closeDeleteModal]);

  useEffect(() => {
    if (!addModalOpen) return;
    const id = requestAnimationFrame(() => addModalNameRef.current?.focus());
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [addModalOpen, closeAddModal]);

  const executeDelete = async () => {
    if (pendingDeleteIndex === null) return;
    const pwd = deleteModalPassword.trim();
    if (!pwd) {
      setDeleteModalError('Enter your admin password to remove this row.');
      return;
    }

    setDeleteModalError(null);
    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (!response.ok) {
        setDeleteModalError('Invalid password. Row was not removed.');
        return;
      }
      removeChurch(pendingDeleteIndex);
      showToast('Removed from your list. Save when you are ready to update the live directory.', 'success');
      closeDeleteModal();
    } catch {
      setDeleteModalError('Could not verify password. Try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const executeSave = async () => {
    if (!pendingSaveChurches) return;
    const pwd = saveModalPassword.trim();
    if (!pwd) {
      setSaveModalError('Enter your admin password to save.');
      return;
    }

    setSaveModalError(null);
    setIsSaving(true);
    try {
      setChurches(pendingSaveChurches);
      const response = await fetch('/api/churches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, churches: pendingSaveChurches }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSaveModalError(
          data?.error ? `Save failed: ${data.error}` : `Save failed (${response.status})`,
        );
        return;
      }
      invalidateChurchCache();
      setBaselineChurches(cloneChurches(pendingSaveChurches));
      showToast('Saved. Public page now uses the updated directory.', 'success');
      closeSaveModal();
    } catch {
      setSaveModalError('Save failed. If local, run with `vercel dev` for API routes.');
    } finally {
      setIsSaving(false);
    }
  };

  const login = async () => {
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        showToast('Login failed. Check your password and try again.', 'error');
        return;
      }
      sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
      setIsAuthenticated(true);
      setPassword('');
      showToast('Signed in.', 'success');
    } catch {
      showToast('Login failed. Run with `pnpm dev:vercel` for local API auth.', 'error');
    }
  };

  const adminSearchTrimmed = adminSearch.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!adminSearchTrimmed) {
      return churches.map((church, index) => ({ church, index }));
    }
    return churches
      .map((church, index) => ({ church, index }))
      .filter(
        ({ church }) =>
          church.name.toLowerCase().includes(adminSearchTrimmed) ||
          church.denomination.toLowerCase().includes(adminSearchTrimmed) ||
          church.address.toLowerCase().includes(adminSearchTrimmed),
      );
  }, [churches, adminSearchTrimmed]);

  const logout = () => {
    clearAdminSessionStorage();
    setIsAuthenticated(false);
    showToast('Signed out.', 'info');
    setPassword('');
  };

  if (isCheckingAuth) {
    return <main className="min-h-screen bg-background text-foreground p-6">Loading admin...</main>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
          <div className="max-w-md mx-auto mt-16">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-sm text-muted-foreground">
                Enter your admin password to manage church listings.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') login();
                }}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
                placeholder="Admin password"
              />
              <button
                onClick={login}
                className="w-full px-4 py-2 rounded-md bg-[#2E7D32] text-white hover:bg-[#1B5E20]"
              >
                Sign In
              </button>
            </div>
          </div>
        </main>
        <AdminToastStack toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Church Directory Admin</h1>
            <p className="text-sm text-muted-foreground">Update church listings on "whysomany.com".</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-md border border-border bg-background hover:bg-muted"
            >
              Add Church
            </button>
            <button
              type="button"
              onClick={openSaveModal}
              disabled={isSaving || !hasUnsavedChanges}
              title={
                hasUnsavedChanges
                  ? 'Publish your edits to the live directory'
                  : 'Make edits, reorder, add, or remove rows — then save'
              }
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                hasUnsavedChanges
                  ? 'bg-[#2E7D32] text-white hover:bg-[#1B5E20] disabled:opacity-50'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {isSaving ? 'Saving…' : hasUnsavedChanges ? 'Save changes' : 'No changes'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 border border-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
            <div className="relative min-w-0 flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <input
                type="search"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-md border border-border bg-background"
                placeholder="Search list (name, denomination, address)…"
                aria-label="Search church list"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-1 lg:max-w-xl lg:flex-none">
              <input
                value={newDenomination}
                onChange={(e) => setNewDenomination(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addDenominationOption();
                }}
                className="min-w-0 flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background"
                placeholder="New denomination (e.g. Baptist)"
                aria-label="New denomination to add to dropdown options"
              />
              <button
                type="button"
                onClick={addDenominationOption}
                className="shrink-0 px-3 py-2 text-sm rounded-md border border-border bg-background hover:bg-muted whitespace-nowrap"
                title="Add denomination option"
              >
                Add option
              </button>
            </div>
          </div>
          {adminSearchTrimmed ? (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {filteredRows.length} of {churches.length}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {filteredRows.length === 0 && churches.length > 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
              No churches match this search. Clear the filter to see all rows.
            </p>
          ) : null}
          {filteredRows.map(({ church, index }) => (
            <div key={index} className="bg-card border border-border rounded-xl p-4 grid gap-2 md:grid-cols-12 shadow-sm">
              <input
                value={church.name}
                onChange={(e) => updateChurch(index, 'name', e.target.value)}
                className="md:col-span-4 px-3 py-2 rounded-md border border-border bg-background"
                placeholder="Church name"
              />
              <select
                value={church.denomination}
                onChange={(e) => updateChurch(index, 'denomination', e.target.value)}
                className="md:col-span-3 px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="" disabled>
                  Select denomination
                </option>
                {denominationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={church.address}
                onChange={(e) => updateChurch(index, 'address', e.target.value)}
                className="md:col-span-3 px-3 py-2 rounded-md border border-border bg-background"
                placeholder="Address"
              />
              <div className="md:col-span-1 flex flex-row items-center justify-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveChurch(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Move church up in list"
                  title="Move up"
                >
                  <ChevronUp className="h-3 w-3" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => moveChurch(index, 'down')}
                  disabled={index === churches.length - 1}
                  className="p-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Move church down in list"
                  title="Move down"
                >
                  <ChevronDown className="h-3 w-3" aria-hidden />
                </button>
              </div>
              <button
                type="button"
                onClick={() => openDeleteModal(index)}
                className="md:col-span-1 px-3 py-2 rounded-md border border-red-400 text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {saveModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="presentation"
          onClick={closeSaveModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="save-modal-title" className="text-lg font-semibold text-foreground">
              Confirm save to live directory
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your admin password to publish these changes.
            </p>
            {saveModalError ? (
              <div
                role="alert"
                className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
              >
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>{saveModalError}</span>
              </div>
            ) : null}
            <input
              ref={saveModalPasswordRef}
              type="password"
              value={saveModalPassword}
              onChange={(e) => {
                setSaveModalPassword(e.target.value);
                setSaveModalError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving) void executeSave();
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
              placeholder="Admin password"
              autoComplete="current-password"
              aria-label="Admin password to confirm save"
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeSaveModal}
                disabled={isSaving}
                className="px-4 py-2 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void executeSave()}
                disabled={isSaving}
                className="px-4 py-2 rounded-md bg-[#2E7D32] text-white hover:bg-[#1B5E20] disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save to live'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="presentation"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-modal-title" className="text-lg font-semibold text-foreground">
              Remove church from list
            </h2>
            <p className="text-sm text-muted-foreground">
              Remove <span className="font-medium text-foreground">“{pendingDeleteLabel}”</span>?<br /> 
              Enter password to confirm.
            </p>
            {deleteModalError ? (
              <div
                role="alert"
                className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
              >
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>{deleteModalError}</span>
              </div>
            ) : null}
            <input
              ref={deleteModalPasswordRef}
              type="password"
              value={deleteModalPassword}
              onChange={(e) => {
                setDeleteModalPassword(e.target.value);
                setDeleteModalError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isDeleting) void executeDelete();
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
              placeholder="Admin password"
              autoComplete="current-password"
              aria-label="Admin password to confirm remove"
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void executeDelete()}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Verifying…' : 'Remove row'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {addModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="presentation"
          onClick={closeAddModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-church-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="add-church-modal-title" className="text-lg font-semibold text-foreground">
              Add a church
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill in all fields. The row is added only when you click Add to list. Use{' '}
              <span className="font-medium text-foreground">Add option</span> above if you need a new denomination
              choice in the dropdown.
            </p>
            {addModalError ? (
              <div
                role="alert"
                className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
              >
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>{addModalError}</span>
              </div>
            ) : null}
            <div className="space-y-3">
              <input
                ref={addModalNameRef}
                type="text"
                value={addChurchDraft.name}
                onChange={(e) => {
                  setAddChurchDraft((d) => ({ ...d, name: e.target.value }));
                  setAddModalError(null);
                }}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
                placeholder="Church name"
                aria-label="Church name"
              />
              <select
                value={addChurchDraft.denomination}
                onChange={(e) => {
                  setAddChurchDraft((d) => ({ ...d, denomination: e.target.value }));
                  setAddModalError(null);
                }}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
                aria-label="Denomination"
              >
                <option value="" disabled>
                  Select denomination
                </option>
                {denominationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={addChurchDraft.address}
                onChange={(e) => {
                  setAddChurchDraft((d) => ({ ...d, address: e.target.value }));
                  setAddModalError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmAddChurch();
                }}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
                placeholder="Address"
                aria-label="Address"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeAddModal}
                className="px-4 py-2 rounded-md border border-border bg-background hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddChurch}
                className="px-4 py-2 rounded-md bg-[#2E7D32] text-white hover:bg-[#1B5E20]"
              >
                Add to list
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
    <AdminToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
