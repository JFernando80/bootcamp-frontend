import { NavLink } from "react-router";
import type { ReactNode } from "react";
import CoursesIcon from "./icons/CoursesIcon";
import CertificatesIcon from "./icons/CertificatesIcon";
import ActivitiesIcon from "./icons/ActivitiesIcon";
import UserAvatar from "./icons/UserAvatar";
import { Plus } from "lucide-react";

type SidebarItem = {
  label: string;
  href: string;
  icon: () => ReactNode;
};

const items: SidebarItem[] = [
  {
    label: "Meus Cursos",
    href: "/myArea",
    icon: () => <CoursesIcon />,
  },
  {
    label: "Certificados",
    href: "/myArea/certificates",
    icon: () => <CertificatesIcon />,
  },
  {
    label: "Atividade",
    href: "/myArea/activities",
    icon: () => <ActivitiesIcon />,
  },
  {
    label: "Criar Curso",
    href: "/createCourse",
    icon: () => <Plus className="w-5 h-5" />,
  },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-blue-600 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600">
            <UserAvatar />
          </div>
          <div>
            <h3 className="font-semibold">Seu Nome</h3>
            <p className="text-blue-200 text-sm">Cargo / Função</p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-800 text-white shadow-md"
                    : "hover:bg-blue-700 text-blue-100"
                }`
              }
              end
            >
              {item.icon()}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
