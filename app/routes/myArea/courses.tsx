import MyCourses from "./components/MyCourses";
import RecentActivities from "./components/RecentActivities";

export default function Courses() {
  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      <MyCourses />
      <RecentActivities />
    </div>
  );
}
