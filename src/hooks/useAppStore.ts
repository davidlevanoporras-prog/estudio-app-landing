import { useCallback, useEffect, useRef, useState } from "react";
import { getVaultValue, setAndPersist } from "../lib/appStore";

export type UseAppStoreResult<T> = {
  /** Valor actual — es `fallback` mientras `isLoading` es `true`, nunca queda `undefined`. */
  value: T;
  /** Actualiza en memoria de inmediato (optimista) y dispara `set` + `save` en la Bóveda en segundo plano. Acepta un valor o un updater, igual que `setState`. */
  setValue: (next: T | ((current: T) => T)) => void;
  /** `true` SOLO durante la primera lectura asíncrona desde disco — para que la UI pueda mostrar un estado de carga sutil en vez de un dato simulado que luego "salta" (Misión 3). */
  isLoading: boolean;
};

/**
 * Custom Hook "Bóveda de Titanio" (Misión 2): conecta reactivamente un único
 * valor persistido en `src/lib/appStore.ts`. Genérico y agnóstico del
 * dominio — tanto el nombre del usuario como la racha de estudio (o
 * cualquier futuro dato vital) se leen/escriben con la misma forma.
 *
 * Cada `key` es independiente: dos componentes que usan la misma `key` NO
 * comparten estado en vivo entre sí (cada uno lee su propia copia al montar)
 * — a propósito, así de simple, porque en este dashboard cada dato vital
 * vive en una sola vista a la vez (ver comentarios en `DashboardHomeView.tsx`
 * sobre por qué el remount al cambiar de vista ya resuelve la sincronía).
 */
export function useAppStore<T>(key: string, fallback: T): UseAppStoreResult<T> {
  const [value, setValueState] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);

  // La lectura inicial siempre debe caer al ÚLTIMO `fallback` recibido, sin
  // forzar a quien llama a memoizarlo ni provocar una segunda lectura del
  // disco si el fallback cambia de identidad entre renders.
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    void (async () => {
      const stored = await getVaultValue<T>(key);
      if (!isMounted) return;
      setValueState(stored ?? fallbackRef.current);
      setIsLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [key]);

  const setValue = useCallback(
    (next: T | ((current: T) => T)) => {
      setValueState((current) => {
        const resolved =
          typeof next === "function"
            ? (next as (current: T) => T)(current)
            : next;
        void setAndPersist(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return { value, setValue, isLoading };
}
