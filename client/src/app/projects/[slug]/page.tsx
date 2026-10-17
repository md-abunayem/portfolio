import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicProject } from "@/lib/api/public";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProject(slug);
  if (result.status !== "success") return { title: "Project" };
  return {
    title: result.data.title,
    description: result.data.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const result = await getPublicProject(slug);

  if (result.status === "not-found") notFound();

  return (
    <>
      <SiteHeader />
      <main className="subpage section-wrap">
        <Link className="back-link" href="/projects">
          <ArrowLeft aria-hidden="true" size={15} /> All projects
        </Link>
        {result.status === "error" ? (
          <p className="empty-state" role="status">{result.message}</p>
        ) : (
          <article className="project-detail">
            <p className="mono-label">{result.data.featured ? "FEATURED PROJECT" : "PROJECT"}</p>
            <h1>{result.data.title}</h1>
            <p className="project-detail__description">{result.data.description}</p>
            <div className="project-detail__visual">
              {result.data.image ? (
                <Image
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 800px) 100vw, 1100px"
                  src={result.data.image}
                />
              ) : (
                <div aria-hidden="true" className="project-card__placeholder">
                  <span className="placeholder-orbit placeholder-orbit--one" />
                  <span className="placeholder-orbit placeholder-orbit--two" />
                  <span className="placeholder-core">N</span>
                </div>
              )}
            </div>
            {result.data.technologies.length > 0 && (
              <ul aria-label="Technologies" className="chip-list">
                {result.data.technologies.map((technology) => (
                  <li className="chip" key={technology.id}>{technology.name}</li>
                ))}
              </ul>
            )}
            <div className="project-card__links">
              {result.data.githubUrl && (
                <a href={result.data.githubUrl} rel="noreferrer" target="_blank">
                  View source <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              )}
              {result.data.liveUrl && (
                <a href={result.data.liveUrl} rel="noreferrer" target="_blank">
                  Live preview <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              )}
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
