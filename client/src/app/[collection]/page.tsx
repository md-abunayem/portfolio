import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecognitionEntries } from "@/components/recognition-entries";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getRecognitionEntries,
  recognitionCollections,
  type RecognitionCollection,
} from "@/lib/recognition";
import { getPublicPortfolio } from "@/lib/api/public";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

function isRecognitionCollection(value: string): value is RecognitionCollection {
  return Object.hasOwn(recognitionCollections, value);
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  if (!isRecognitionCollection(collection)) return { title: "Not found" };

  const info = recognitionCollections[collection];
  return { title: info.title, description: info.description };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection } = await params;
  if (!isRecognitionCollection(collection)) notFound();

  const result = await getPublicPortfolio();
  const entries =
    result.status === "success" ? getRecognitionEntries(result.data, collection) : [];
  const info = recognitionCollections[collection];

  return (
    <>
      <SiteHeader />
      <main className="subpage section-wrap">
        <Link className="back-link" href={`/#${collection}`}>
          <ArrowLeft aria-hidden="true" size={15} /> Back to home
        </Link>
        <div className="section-heading">
          <p className="mono-label">{info.eyebrow}</p>
          <h1>{info.title}</h1>
        </div>
        {result.status === "error" ? (
          <p className="empty-state" role="status">{result.message}</p>
        ) : (
          <RecognitionEntries
            collection={collection}
            emptyMessage={`${info.label} will appear here once published.`}
            entries={entries}
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
