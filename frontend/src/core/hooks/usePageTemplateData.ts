import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspaceStore } from '@/core/store/workspaceStore';

type PersistOptions = {
  immediate?: boolean;
};

function sanitizeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, entry]) => {
      acc[key] = sanitizeValue(entry);
      return acc;
    }, {});
  }

  return value;
}

export function usePageTemplateData<T extends Record<string, unknown>>(
  groupId: string,
  pageId: string,
  defaultData: T,
) {
  const page = useWorkspaceStore(
    useCallback((state) => {
      const group = state.workspace?.groups?.find((g) => g.id === groupId);
      return group?.pages?.find((p) => p.id === pageId);
    }, [groupId, pageId]),
  );
  const updatePageData = useWorkspaceStore((state) => state.updatePageData);

  const [data, setData] = useState<T>(defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resolvedData = useMemo(() => {
    if (page?.data && Object.keys(page.data as Record<string, unknown>).length > 0) {
      return {
        ...defaultData,
        ...(page.data as T),
      };
    }

    return defaultData;
  }, [defaultData, page?.data]);

  useEffect(() => {
    setData(resolvedData);
  }, [resolvedData]);

  const persist = useCallback(
    (nextData: T, options?: PersistOptions) => {
      const performSave = async () => {
        setIsSaving(true);
        try {
          await updatePageData(groupId, pageId, sanitizeValue(nextData) as Record<string, unknown>);
        } finally {
          setIsSaving(false);
        }
      };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      if (options?.immediate) {
        void performSave();
      } else {
        saveTimeoutRef.current = setTimeout(() => {
          void performSave();
        }, 600);
      }
    },
    [groupId, pageId, updatePageData],
  );

  const setPersistentData = useCallback(
    (updater: T | ((current: T) => T), options?: PersistOptions) => {
      setData((current) => {
        const nextData = typeof updater === 'function' ? (updater as (value: T) => T)(current) : updater;
        persist(nextData, options);
        return nextData;
      });
    },
    [persist],
  );

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    },
    [],
  );

  return {
    data,
    setData: setPersistentData,
    isSaving,
  };
}
