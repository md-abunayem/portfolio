import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/features/portfolio/schema";

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
};

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <article className={`project-card${featured ? " project-card--featured" : ""}`}>
      <div className="project-card__visual">
        {project.image ? (
          <Image
            alt=""
            className="project-card__image"
            fill
            sizes={featured ? "(max-width: 800px) 100vw, 55vw" : "(max-width: 800px) 100vw, 36vw"}
            src={project.image}
          />
        ) : (
          <div aria-hidden="true" className="project-card__placeholder">
            <span className="placeholder-orbit placeholder-orbit--one" />
            <span className="placeholder-orbit placeholder-orbit--two" />
            <span className="placeholder-core">N</span>
          </div>
        )}
        <span className="project-card__index mono-label">
          {featured ? "FEATURED PROJECT" : "PROJECT"}
        </span>
      </div>
      <div className="project-card__body">
        <div className="project-card__heading">
          <div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
          <Link
            aria-label={`View ${project.title} project details`}
            className="icon-link"
            href={`/projects/${project.slug}`}
          >
            <ArrowUpRight aria-hidden="true" size={19} />
          </Link>
        </div>
        {project.technologies.length > 0 && (
          <ul aria-label="Technologies" className="chip-list">
            {project.technologies.map((technology) => (
              <li className="chip" key={technology.id}>
                {technology.name}
              </li>
            ))}
          </ul>
        )}
        <div className="project-card__links">
          {project.githubUrl && (
            <a href={project.githubUrl} rel="noreferrer" target="_blank">
              Source <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} rel="noreferrer" target="_blank">
              Live preview <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
