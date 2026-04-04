import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export const useToast = () => {
  const success = useCallback((message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  }, []);

  const error = useCallback((message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    });
  }, []);

  const loading = useCallback((message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options,
    });
  }, []);

  const dismiss = useCallback((id) => {
    toast.dismiss(id);
  }, []);

  const promise = useCallback((promise, messages = {}) => {
    return toast.promise(promise, messages, {
      duration: 4000,
    });
  }, []);

  return useMemo(
    () => ({ success, error, loading, dismiss, promise }),
    [success, error, loading, dismiss, promise]
  );
};
