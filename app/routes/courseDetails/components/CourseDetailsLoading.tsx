export function CourseDetailsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <div className="text-xl text-gray-600">Carregando curso...</div>
      </div>
    </div>
  );
}
