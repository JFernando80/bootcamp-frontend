import { Banner } from "./components/banner";
import { Values } from "./components/values";
import { ProblemSolution } from "./components/problemSolution";
import { Features } from "./components/features";
import { CallToAction } from "./components/callToAction";

export default function About() {
  return (
    <main>
      <Banner />
      <Values />
      <ProblemSolution />
      <Features />
      <CallToAction />
    </main>
  );
}
