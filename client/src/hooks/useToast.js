import { toast } from "sonner";

export const useToast = () => {
  const success = (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  };

  const error = (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    });
  };

  const loading = (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options,
    });
  };

  const dismiss = (id) => {
    toast.dismiss(id);
  };

  const promise = (promise, messages = {}) => {
    return toast.promise(promise, messages, {
      duration: 4000,
    });
  };

  return { success, error, loading, dismiss, promise };
};
