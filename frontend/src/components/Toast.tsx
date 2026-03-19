import { useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;
type ToastFn = (message: string, type?: Toast["type"]) => void;

let globalToast: ToastFn = () => {};

export function useToast() {
  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    globalToast(message, type);
  }, []);
  return { toast };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    globalToast = (message, type = "info") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
  }, []);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" && (
            <CheckCircle size={16} color="var(--seed-color)" />
          )}
          {t.type === "error" && (
            <XCircle size={16} color="var(--error-color)" />
          )}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "2px",
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
