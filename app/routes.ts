import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("about", "routes/about/about.tsx"),
  route("login", "routes/login/login.tsx"),
  route("register", "routes/register/register.tsx"),
  route("myArea", "routes/myArea/myArea.tsx", [
    index("routes/myArea/courses.tsx"),
    route("certificates", "routes/myArea/certificates.tsx"),
  ]),
  route("courses/:courseId", "routes/course/Course.tsx"),
] satisfies RouteConfig;
