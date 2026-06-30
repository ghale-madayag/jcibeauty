import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CmsSectionForm } from "@/components/admin/cms-section-form";
import { updateSectionAction } from "@/features/cms/cms.actions";

export default async function EditCmsSectionPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const section = await db.homepageSection.findUnique({ where: { key } });
  if (!section) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit Section</h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">{section.key}</p>
      <div className="mt-8">
        <CmsSectionForm
          action={updateSectionAction.bind(null, key)}
          title={section.title ?? ""}
          isActive={section.isActive}
          content={JSON.stringify(section.content, null, 2)}
        />
      </div>
    </div>
  );
}
