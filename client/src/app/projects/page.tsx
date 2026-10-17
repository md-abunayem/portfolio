import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicPortfolio } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "Projects",
  description: "Published projects by Md. Abu Nayem.",
};

export default async function ProjectsPage() {
  const result = await getPublicPortfolio();

  return (
    <>
      <SiteHeader />
      <main className="subpage section-wrap">
        <Link className="back-link" href="/">
          <ArrowLeft aria-hidden="true" size={15} /> Home
        </Link>
        <div className="section-heading">
          <p className="mono-label">SELECTED WORK</p>
          <h1>
            Projects with <span>purpose.</span>
          </h1>
        </div>
        {result.status === "error" ? (
          <p className="empty-state" role="status">{result.message}</p>
        ) : result.data.projects.length > 0 ? (
          <div className="project-grid">
            {result.data.projects.map((project) => (
              <ProjectCard
                featured={project.featured}
                key={project.id}
                project={project}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">Projects will appear here once published.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
