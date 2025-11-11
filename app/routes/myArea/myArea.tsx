import Sidebar from "./components/Sidebar";
import MyCourses from "./components/MyCourses";
import Certificates from "./components/Certificates";
import RecentActivities from "./components/RecentActivities";

export default function MyArea() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-12">
        <MyCourses />
        <Certificates />
        <RecentActivities />
      </main>
    </div>
  );
}
