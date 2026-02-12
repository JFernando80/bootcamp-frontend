import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("about", "routes/about/about.tsx"),
  route("login", "routes/login/login.tsx"),
  route("register", "routes/register/register.tsx"),
  route("courses", "routes/courses/courses.tsx"),
  route("courses/:id", "routes/course/Course.tsx"),
  route("courseDetails/:courseId", "routes/courseDetails/courseDetails.tsx"),
  route("createCourse", "routes/createCourse/createCourse.tsx"),
  route("manageCourses", "routes/manageCourses/manageCourses.tsx"),
  route("editCourse/:slug", "routes/editCourse/editCourse.tsx"),
  route("myArea", "routes/myArea/myArea.tsx", [
    index("routes/myArea/courses.tsx"),
    route("certificates", "routes/myArea/certificates.tsx"),
    route("activities", "routes/myArea/activities.tsx"),
  ]),
] satisfies RouteConfig;
