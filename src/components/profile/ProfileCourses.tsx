import React from 'react';

interface Course {
  id: string;
  title: string;
  description?: string;
  level: string;
  enrollment_count: number;
}

interface ProfileCoursesProps {
  courses: Course[];
}

const ProfileCourses: React.FC<ProfileCoursesProps> = ({ courses }) => {
  if (!courses || courses.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses</h2>
      <div className="space-y-3">
        {courses.slice(0, 5).map((course) => (
          <div key={course.id} className="border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {course.title}
            </h4>
            {course.description && (
              <p className="text-gray-600 text-xs">{course.description.substring(0, 100)}...</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 capitalize">{course.level}</span>
              {course.enrollment_count > 0 && (
                <span className="text-xs text-gray-500">
                  {course.enrollment_count} enrolled
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfileCourses;
