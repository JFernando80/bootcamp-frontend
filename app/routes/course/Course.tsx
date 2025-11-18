import CourseVideo from "./components/Video";
import CourseAbout from "./components/About";
import CourseForum from "./components/Forum";
import CourseContent from "./components/Content";

const Course = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a
        href="/myArea"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all
        bg-white shadow-sm hover:bg-gray-100 text-gray-700 h-9 px-4 py-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-left"
        >
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        Voltar para Meus Cursos
      </a>

      <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-6">
        Gestão de ONGs
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseVideo />
          <CourseAbout />
          <CourseForum />
        </div>

        <div>
          <CourseContent />
        </div>
      </div>
    </div>
  );
};

export default Course;
