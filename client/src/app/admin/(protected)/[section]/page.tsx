import { notFound } from "next/navigation";
import { AdminMessages } from "@/features/admin/admin-messages";
import { AdminResourcePage } from "@/features/admin/resource-page";
import { profileResource, resources } from "@/features/admin/resources";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (section === "messages") return <AdminMessages />;
  if (section === "profile") {
    return <AdminResourcePage key={section} resource={profileResource} singleton />;
  }

  const resource = resources[section];
  if (!resource) notFound();

  return <AdminResourcePage key={section} resource={resource} />;
}
