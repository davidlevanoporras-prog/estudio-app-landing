import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLanguage } from "../i18n/LanguageContext";
import ConfirmDialog from "./ConfirmDialog";

export type ConfirmRequest = {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmFn = (request?: ConfirmRequest) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

type PendingConfirm = ConfirmRequest & {
  resolve: (value: boolean) => void;
};

/**
 * Confirmación global (promesa) — sustituye `window.confirm` en acciones
 * destructivas. Usa el copy por defecto de i18n (`common.confirm*`).
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { dict } = useLanguage();
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const pendingRef = useRef<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((request = {}) => {
    return new Promise<boolean>((resolve) => {
      const next: PendingConfirm = { ...request, resolve };
      pendingRef.current = next;
      setPending(next);
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    pendingRef.current?.resolve(value);
    pendingRef.current = null;
    setPending(null);
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {pending && (
        <ConfirmDialog
          title={pending.title ?? dict.common.confirmTitle}
          message={pending.message ?? dict.common.confirmPermanentMessage}
          confirmLabel={
            pending.confirmLabel ??
            (pending.destructive === false
              ? dict.common.confirmAction
              : dict.common.deleteAction)
          }
          cancelLabel={pending.cancelLabel ?? dict.common.cancelLabel}
          destructive={pending.destructive !== false}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}
