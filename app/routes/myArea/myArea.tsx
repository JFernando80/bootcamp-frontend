import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router";

export default function MyArea() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 space-y-12">
        <Outlet />
      </main>
    </div>
  );
}
