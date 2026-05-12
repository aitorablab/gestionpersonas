import { useState } from "react";

interface SaveState {
  saving: boolean;
  error: string | null;
}

export function useSaving() {
  const [state, setState] = useState<SaveState>({ saving: false, error: null });

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    setState({ saving: true, error: null });
    try {
      await fn();
      setState({ saving: false, error: null });
      return true;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message
        ?? (err as { message?: string })?.message
        ?? "Error al guardar";
      setState({ saving: false, error: msg });
      return false;
    }
  }

  return { ...state, run };
}
