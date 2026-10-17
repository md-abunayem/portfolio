import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  GraduationCap,
  Layers3,
  MoveUpRight,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { OrbitProfile } from "@/components/hero/OrbitProfile";
import { ProjectCard } from "@/components/project-card";
import { RecognitionEntries } from "@/components/recognition-entries";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicPortfolio } from "@/lib/api/public";
import {
  getRecognitionEntries,
  recognitionCollections,
} from "@/lib/recognition";

const fallbackHeadline = "Computer Science graduate · Full-Stack Developer";
const fallbackBio =
  "I’m Md. Abu Nayem, a Computer Science graduate and full-stack developer focused on building useful web applications.";
const trustSignals = ["MERN", "Next.js", "TypeScript"] as const;

function formatDate(date: string | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
    new Date(date),
  );
}

export default async function HomePage() {
  const result = await getPublicPortfolio();
  const portfolio = result.status === "success" ? result.data : null;
  const profile = portfolio?.profile;
  const headline = profile?.headline?.trim() || fallbackHeadline;
  const intro = profile?.shortBio?.trim() || profile?.about?.trim() || fallbackBio;
  const featuredProject =
    portfolio?.projects.find((project) => project.featured) ?? portfolio?.projects[0];
  const awardEntries = portfolio ? getRecognitionEntries(portfolio, "awards") : [];
  const certificationEntries = portfolio
    ? getRecognitionEntries(portfolio, "certifications")
    : [];
  const researchEntries = portfolio ? getRecognitionEntries(portfolio, "research") : [];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader resumeUrl={profile?.resumeUrl} />
      <main id="main">
        <section aria-labelledby="hero-title" className="hero section-wrap" id="top">
          <div className="hero__copy">
            <p className="eyebrow">
              <span className="status-dot" />
              // {headline}
            </p>
            <h1 id="hero-title">
              Clean Code.
              <br />
              <span>Thoughtful Engineering.</span>
              <br />
              Real-World Impact.
            </h1>
            <p className="hero__intro">{intro}</p>
            <div className="hero__actions">
              <Link className="button button--primary" href="#work">
                Explore my work <MoveUpRight aria-hidden="true" size={17} />
              </Link>
              <Link className="button button--ghost" href="#contact">
                Get in touch
              </Link>
              <a
                className="button button--ghost"
                href="/cv.pdf"
                rel="noreferrer"
                target="_blank"
              >
                Download CV <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </div>
            <ul aria-label="Technology stack" className="hero__trust-signals">
              {trustSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
          <div className="hero-art">
            <OrbitProfile imageUrl={profile?.profileImageUrl} name={profile?.name || "Md. Abu Nayem"} />
          </div>
          <a className="hero__scroll mono-label" href="#about">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown aria-hidden="true" className="hero__scroll-arrow" size={14} />
          </a>
        </section>

        {result.status === "error" && (
          <p className="api-notice section-wrap" role="status">
            {result.message}
          </p>
        )}

        <section aria-labelledby="about-title" className="content-section section-wrap" id="about">
          <div className="section-heading">
            <p className="mono-label">01 / ABOUT</p>
            <h2 id="about-title">
              A little about <span>me.</span>
            </h2>
          </div>
          <div className="about-grid">
            <p className="about-lead">{profile?.about?.trim() || fallbackBio}</p>
          </div>
          <div className="fact-strip">
            <div>
              <GraduationCap aria-hidden="true" />
              <span className="mono-label">EDUCATION</span>
              <strong>B.Sc. in CSE</strong>
              <span>Daffodil International University</span>
            </div>
            <div>
              <BriefcaseBusiness aria-hidden="true" />
              <span className="mono-label">FOCUS</span>
              <strong>Full-stack development</strong>
              <span>MERN · Next.js</span>
            </div>
            <div>
              <Layers3 aria-hidden="true" />
              <span className="mono-label">FEATURED WORK</span>
              <strong>Streamly</strong>
              <span>Full-stack video platform</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="experience-title" className="content-section section-wrap" id="experience">
          <div className="section-heading">
            <p className="mono-label">02 / EXPERIENCE</p>
            <h2 id="experience-title">
              Work that shaped <span>my path.</span>
            </h2>
          </div>
          {portfolio?.experiences.length ? (
            <ol className="timeline">
              {portfolio.experiences.map((experience) => (
                <li className="timeline__item" key={experience.id}>
                  <span className="timeline__date mono-label">
                    {formatDate(experience.startDate)} —{" "}
                    {experience.current ? "Present" : formatDate(experience.endDate) ?? "—"}
                  </span>
                  <h4>{experience.position}</h4>
                  <p className="timeline__meta">
                    {experience.company}
                    {experience.location ? ` · ${experience.location}` : ""}
                  </p>
                  <p>{experience.description}</p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState message="Experience details have not been published." compact />
          )}
        </section>

        <section aria-labelledby="work-title" className="content-section section-wrap" id="work">
          <div className="section-heading section-heading--split">
            <div>
              <p className="mono-label">03 / PROJECTS</p>
              <h2 id="work-title">
                Projects with <span>purpose.</span>
              </h2>
            </div>
            {portfolio?.projects && portfolio.projects.length > 0 && (
              <div className="section-heading__aside">
                <span className="section-count mono-label">
                  {String(portfolio.projects.length).padStart(2, "0")} PROJECTS
                </span>
                <Link className="text-link" href="/projects">
                  View all <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              </div>
            )}
          </div>
          {portfolio?.projects.length ? (
            <div className="project-grid">
              {portfolio.projects.map((project) => (
                <ProjectCard
                  featured={project.id === featuredProject?.id}
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Projects will appear here once published." />
          )}
        </section>

        <section aria-labelledby="skills-title" className="content-section section-wrap" id="skills">
          <div className="section-heading">
            <p className="mono-label">04 / SKILLS</p>
            <h2 id="skills-title">
              Tools I work <span>with.</span>
            </h2>
          </div>
          {portfolio?.skills.length ? (
            <>
              <div className="skills-grid">
                {Object.entries(
                  portfolio.skills.reduce<Record<string, typeof portfolio.skills>>((groups, skill) => {
                    (groups[skill.category] ??= []).push(skill);
                    return groups;
                  }, {}),
                ).map(([category, skills]) => (
                  <article className="skill-group" key={category}>
                    <h3>{category}</h3>
                    <ul className="chip-list">
                      {skills.map((skill) => (
                        <li className="chip" key={skill.id}>
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="skills-marquee">
                <p className="skills-marquee__label mono-label">IN MY TOOLKIT</p>
                <div className="skills-marquee__viewport">
                  <div className="skills-marquee__track">
                    {[false, true].map((isDuplicate) => (
                      <ul
                        aria-hidden={isDuplicate || undefined}
                        aria-label={isDuplicate ? undefined : "Skills"}
                        className="skills-marquee__group"
                        key={isDuplicate ? "duplicate" : "skills"}
                      >
                        {portfolio.skills.map((skill) => (
                          <li className="skills-marquee__item" key={skill.id}>
                            {skill.name}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState message="Skills will appear here once added to the portfolio." />
          )}
        </section>

        <section aria-labelledby="education-title" className="content-section section-wrap" id="education">
          <div className="section-heading">
            <p className="mono-label">05 / EDUCATION</p>
            <h2 id="education-title">
              Learning that built <span>the foundation.</span>
            </h2>
          </div>
          {portfolio?.education.length ? (
            <ol className="timeline">
              {portfolio.education.map((education) => (
                <li className="timeline__item" key={education.id}>
                  <span className="timeline__date mono-label">
                    {formatDate(education.startDate)} — {formatDate(education.endDate) ?? "Present"}
                  </span>
                  <h4>{education.degree}{education.field ? ` · ${education.field}` : ""}</h4>
                  <p className="timeline__meta">{education.institution}</p>
                  {education.description && <p>{education.description}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <div className="education-fact">
              <span className="timeline__date mono-label">BACHELOR&apos;S DEGREE</span>
              <h4>B.Sc. in CSE</h4>
              <p className="timeline__meta">Daffodil International University</p>
            </div>
          )}
        </section>

        <section aria-labelledby="awards-title" className="content-section section-wrap" id="awards">
          <div className="section-heading section-heading--split">
            <div>
              <p className="mono-label">06 / AWARDS</p>
              <h2 id="awards-title">Recognition along <span>the way.</span></h2>
            </div>
            {awardEntries.length > 0 && (
              <CollectionLink collection="awards" count={awardEntries.length} />
            )}
          </div>
          <RecognitionEntries
            collection="awards"
            emptyMessage="Awards will appear here when published."
            entries={awardEntries.slice(0, 2)}
          />
        </section>

        <section
          aria-labelledby="certifications-title"
          className="content-section section-wrap"
          id="certifications"
        >
          <div className="section-heading section-heading--split">
            <div>
              <p className="mono-label">07 / CERTIFICATIONS</p>
              <h2 id="certifications-title">Learning in <span>practice.</span></h2>
            </div>
            {certificationEntries.length > 0 && (
              <CollectionLink collection="certifications" count={certificationEntries.length} />
            )}
          </div>
          <RecognitionEntries
            collection="certifications"
            emptyMessage="Certifications will appear here once published."
            entries={certificationEntries.slice(0, 2)}
          />
        </section>

        <section aria-labelledby="research-title" className="content-section section-wrap" id="research">
          <div className="section-heading section-heading--split">
            <div>
              <p className="mono-label">08 / RESEARCH</p>
              <h2 id="research-title">Ideas explored <span>in depth.</span></h2>
            </div>
            {researchEntries.length > 0 && (
              <CollectionLink collection="research" count={researchEntries.length} />
            )}
          </div>
          <RecognitionEntries
            collection="research"
            emptyMessage="Research and publications will appear here when published."
            entries={researchEntries.slice(0, 2)}
          />
        </section>

        <section aria-labelledby="contact-title" className="contact-section section-wrap" id="contact">
          <div className="contact-panel">
            <div className="contact-panel__copy">
              <p className="mono-label">09 / GET IN TOUCH</p>
              <h2 id="contact-title">
                Have a good
                <br />
                one in <span>mind?</span>
              </h2>
              <p>
                For thoughtful collaborations, project conversations, or a simple
                hello — send a note.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return <p className={`empty-state${compact ? " empty-state--compact" : ""}`}>{message}</p>;
}

function CollectionLink({
  collection,
  count,
}: {
  collection: keyof typeof recognitionCollections;
  count: number;
}) {
  return (
    <div className="section-heading__aside">
      <span className="section-count mono-label">
        {String(count).padStart(2, "0")} {recognitionCollections[collection].label.toUpperCase()}
      </span>
      <Link className="text-link" href={`/${collection}`}>
        View all <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </div>
  );
}
