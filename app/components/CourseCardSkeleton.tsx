export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video bg-gray-200" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />

        {/* Organization */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function CourseSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
