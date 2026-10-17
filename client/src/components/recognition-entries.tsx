import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Expand } from "lucide-react";
import {
  type RecognitionCollection,
  type RecognitionEntry,
} from "@/lib/recognition";

function formatDate(date: string | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
    new Date(date),
  );
}

export function RecognitionEntries({
  collection,
  emptyMessage,
  entries,
}: {
  collection: RecognitionCollection;
  emptyMessage: string;
  entries: RecognitionEntry[];
}) {
  if (entries.length === 0) {
    return <p className="empty-state empty-state--compact">{emptyMessage}</p>;
  }

  return (
    <ul className="recognition-list">
      {entries.map((entry) => (
        <li
          className={`recognition-entry${entry.imageUrl ? "" : " recognition-entry--text-only"}`}
          key={entry.id}
        >
          <div className="recognition-entry__content">
            <p className="mono-label">{formatDate(entry.date) ?? entry.source ?? "FEATURED"}</p>
            <h3>{entry.title}</h3>
            {entry.source && <p className="timeline__meta">{entry.source}</p>}
            {entry.description && <p className="recognition-entry__description">{entry.description}</p>}
            {entry.link && (
              <a
                className="text-link"
                href={entry.link}
                rel="noreferrer"
                target="_blank"
              >
                {collection === "certifications" ? "View credential" : "Learn more"}
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            )}
          </div>
          {entry.imageUrl && (
            <Link
              aria-label={`View ${entry.title} image in larger size`}
              className="recognition-entry__image"
              href={`/recognition/${collection}/${encodeURIComponent(entry.id)}`}
            >
              <Image
                alt={`${entry.title}${collection === "certifications" ? " certificate" : ""}`}
                fill
                sizes="(max-width: 680px) 100vw, (max-width: 1000px) 45vw, 420px"
                src={entry.imageUrl}
              />
              <span className="recognition-entry__image-action">
                <Expand aria-hidden="true" size={14} />
                View image
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
