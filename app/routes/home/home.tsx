import type { Route } from "../../+types/root";

import { Banner } from "./components/Banner";
import { Catalog } from "./components/Catalog";
import { Footer } from "~/components/footer/Footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NGO Cursos - Educação Gratuita e Certificada" },
    { name: "description", content: "" },
  ];
}

export default function Home() {
  return (
    <main>
      <Banner />
      <Catalog />
      <Footer />
    </main>
  );
}
