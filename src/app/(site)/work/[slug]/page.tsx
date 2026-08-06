import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProjectView } from "@/components/ProjectView";
import { getSiteContent } from "@/content";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { projects } = await getSiteContent();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getSiteContent();
  const project = projects.find((candidate) => candidate.slug === slug);

  if (!project) return {};

  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: `${project.title} · Om Rajpal`,
      description: project.tagline,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { projects } = await getSiteContent();

  const index = projects.findIndex((candidate) => candidate.slug === slug);
  if (index === -1) notFound();

  return (
    <ProjectView
      project={projects[index]}
      index={index}
      total={projects.length}
      previous={projects[index - 1]}
      next={projects[index + 1]}
    />
  );
}
