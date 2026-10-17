"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, MoreHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const mainNavigation = [
  { href: "/#top", label: "Home", section: "top" },
  { href: "/#about", label: "About", section: "about" },
  { href: "/#experience", label: "Experience", section: "experience" },
  { href: "/#work", label: "Projects", section: "work" },
  { href: "/#skills", label: "Skills", section: "skills" },
];

const moreNavigation = [
  { href: "/#education", label: "Education", section: "education" },
  { href: "/#awards", label: "Awards", section: "awards" },
  { href: "/#certifications", label: "Certifications", section: "certifications" },
  { href: "/#research", label: "Research", section: "research" },
  { href: "/#contact", label: "Contact", section: "contact" },
];

const observedSections = [
  "top",
  "about",
  "experience",
  "work",
  "skills",
  "education",
  "awards",
  "certifications",
  "research",
  "contact",
];

export function SiteHeader({ resumeUrl }: { resumeUrl?: string | null }) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const currentActiveSection = pathname === "/" ? activeSection : "";
  const moreContainsActiveSection = moreNavigation.some(
    (item) => item.section === currentActiveSection,
  );
  const menuOpen = mobileOpen || moreOpen;

  useEffect(() => {
    if (pathname !== "/") return;

    const sections = observedSections
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              Math.abs(first.boundingClientRect.top - window.innerHeight * 0.32) -
              Math.abs(second.boundingClientRect.top - window.innerHeight * 0.32),
          );

        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMobileOpen(false);
        setMoreOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setMoreOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenus() {
    setMobileOpen(false);
    setMoreOpen(false);
  }

  function renderNavigationLink(item: (typeof mainNavigation)[number]) {
    const active = currentActiveSection === item.section;
    return (
      <Link
        aria-current={active ? "location" : undefined}
        className="site-nav__link after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 hover:after:scale-x-100 aria-[current=location]:after:scale-x-100"
        href={item.href}
        key={item.href}
        onClick={closeMenus}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <Link
          aria-label="Md. Abu Nayem home"
          className="wordmark"
          href="/"
          onClick={closeMenus}
        >
          <span className="wordmark__mark">N</span>
          <span>Md. Abu Nayem</span>
        </Link>
        <button
          aria-controls="site-navigation"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="site-nav__menu-toggle"
          onClick={() => {
            setMobileOpen((open) => !open);
            setMoreOpen(false);
          }}
          type="button"
        >
          {mobileOpen ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
        </button>
        <nav
          aria-label="Main navigation"
          className={`site-nav${mobileOpen ? " site-nav--open" : ""}`}
          id="site-navigation"
        >
          {mainNavigation.map(renderNavigationLink)}
          {moreNavigation.map((item) => {
            const active = currentActiveSection === item.section;
            return (
              <Link
                aria-current={active ? "location" : undefined}
                className="site-nav__link site-nav__secondary-link after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 hover:after:scale-x-100 aria-[current=location]:after:scale-x-100"
                href={item.href}
                key={item.href}
                onClick={closeMenus}
              >
                {item.label}
              </Link>
            );
          })}
          {resumeUrl && (
            <a
              aria-label="View résumé (opens in a new tab)"
              className="site-nav__social site-nav__resume-link"
              href={resumeUrl}
              rel="noreferrer"
              target="_blank"
              title="Résumé"
            >
              <FileText aria-hidden="true" size={18} />
            </a>
          )}
          <div className={`site-nav__more${moreOpen ? " site-nav__more--open" : ""}`}>
            <button
              aria-controls="site-nav-more-links"
              aria-expanded={moreOpen}
              className={`site-nav__more-toggle${moreContainsActiveSection ? " is-active" : ""}`}
              onClick={() => setMoreOpen((open) => !open)}
              type="button"
            >
              More <MoreHorizontal aria-hidden="true" size={16} />
            </button>
            <div className="site-nav__more-panel" id="site-nav-more-links">
              {moreNavigation.map((item) => {
                const active = currentActiveSection === item.section;
                return (
                  <Link
                    aria-current={active ? "location" : undefined}
                    className="site-nav__link after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 hover:after:scale-x-100 aria-[current=location]:after:scale-x-100"
                    href={item.href}
                    key={item.href}
                    onClick={closeMenus}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="site-nav__actions">
            <span aria-hidden="true" className="site-nav__separator" />
            <a
              aria-label="GitHub profile (opens in a new tab)"
              className="site-nav__social"
              href="https://github.com/md-abunayem"
              rel="noreferrer"
              target="_blank"
            >
              <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.807 5.623-5.48 5.921.43.372.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              aria-label="LinkedIn profile (opens in a new tab)"
              className="site-nav__social"
              href="https://linkedin.com/in/md-abunayem"
              rel="noreferrer"
              target="_blank"
            >
              <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
                <path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V9h3v10zM6.5 7.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V9h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" />
              </svg>
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
