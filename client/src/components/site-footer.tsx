import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span className="mono-label">© {new Date().getFullYear()} Md. Abu Nayem</span>
      <p>Designed and built with care.</p>
      <div className="site-footer__socials">
        <a
          aria-label="GitHub profile"
          href="https://github.com/md-abunayem"
          rel="noreferrer"
          target="_blank"
        >
          GitHub <ArrowUpRight aria-hidden="true" size={13} />
        </a>
        <a
          aria-label="LinkedIn profile"
          href="https://linkedin.com/in/md-abunayem"
          rel="noreferrer"
          target="_blank"
        >
          LinkedIn <ArrowUpRight aria-hidden="true" size={13} />
        </a>
        <a className="back-to-top" href="#top">
          Back to top <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      </div>
    </footer>
  );
}
