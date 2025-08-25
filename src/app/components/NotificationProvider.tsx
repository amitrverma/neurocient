"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type NotificationType = "info" | "success" | "error";

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const remove = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const notify = (message: string, type: NotificationType = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 5000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            role="status"
            aria-live="polite"
            className={`flex items-start rounded-md px-4 py-3 text-sm text-white shadow-lg ${
              n.type === "error"
                ? "bg-red-600"
                : n.type === "success"
                ? "bg-green-600"
                : "bg-gray-800"
            }`}
          >
            <span className="flex-1">{n.message}</span>
            <button
              onClick={() => remove(n.id)}
              aria-label="Dismiss notification"
              className="ml-3 text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

