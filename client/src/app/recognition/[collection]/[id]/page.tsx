import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getRecognitionEntries,
  recognitionCollections,
  type RecognitionCollection,
} from "@/lib/recognition";
import { getPublicPortfolio } from "@/lib/api/public";

type RecognitionImagePageProps = {
  params: Promise<{ collection: string; id: string }>;
};

function isRecognitionCollection(value: string): value is RecognitionCollection {
  return Object.hasOwn(recognitionCollections, value);
}

export async function generateMetadata({
  params,
}: RecognitionImagePageProps): Promise<Metadata> {
  const { collection, id } = await params;
  if (!isRecognitionCollection(collection)) return { title: "Not found" };

  const result = await getPublicPortfolio();
  if (result.status !== "success") return { title: recognitionCollections[collection].title };
  const entry = getRecognitionEntries(result.data, collection).find((item) => item.id === id);
  return { title: entry?.title ?? recognitionCollections[collection].title };
}

export default async function RecognitionImagePage({
  params,
}: RecognitionImagePageProps) {
  const { collection, id } = await params;
  if (!isRecognitionCollection(collection)) notFound();

  const result = await getPublicPortfolio();
  if (result.status === "error") {
    return (
      <>
        <SiteHeader />
        <main className="subpage section-wrap">
          <p className="empty-state" role="status">{result.message}</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const entry = getRecognitionEntries(result.data, collection).find((item) => item.id === id);
  if (!entry?.imageUrl) notFound();

  return (
    <>
      <SiteHeader />
      <main className="subpage section-wrap">
        <Link className="back-link" href={`/${collection}`}>
          <ArrowLeft aria-hidden="true" size={15} /> All {recognitionCollections[collection].label.toLowerCase()}
        </Link>
        <article className="recognition-detail">
          <div className="recognition-detail__copy">
            <p className="mono-label">
              {recognitionCollections[collection].eyebrow}
              {entry.date
                ? ` · ${new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(entry.date))}`
                : ""}
            </p>
            <h1>{entry.title}</h1>
            {entry.source && <p className="timeline__meta">{entry.source}</p>}
            {entry.description && <p>{entry.description}</p>}
            {entry.link && (
              <a className="text-link" href={entry.link} rel="noreferrer" target="_blank">
                {collection === "certifications" ? "View credential" : "Learn more"}
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            )}
          </div>
          <div className="recognition-detail__image">
            <Image
              alt={`${entry.title}${collection === "certifications" ? " certificate" : ""}`}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 1100px"
              src={entry.imageUrl}
            />
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
