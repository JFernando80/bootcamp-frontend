import React, { createContext, useContext, useState } from "react";

type Notification = {
  id: string;
  type: "info" | "success" | "error";
  message: string;
};

const NotificationContext = createContext<{
  notify: (n: Omit<Notification, "id">) => void;
} | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [list, setList] = useState<Notification[]>([]);

  function notify(n: Omit<Notification, "id">) {
    const id = Math.random().toString(36).slice(2, 9);
    const item = { id, ...n };
    setList((s) => [item, ...s]);
    setTimeout(() => setList((s) => s.filter((i) => i.id !== id)), 5000);
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {list.map((n) => (
          <div
            key={n.id}
            className={`max-w-sm px-4 py-2 rounded shadow-lg text-sm text-white ${
              n.type === "error"
                ? "bg-red-600"
                : n.type === "success"
                  ? "bg-green-600"
                  : "bg-blue-600"
            }`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
