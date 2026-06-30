import Link from "next/link";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminCmsPage() {
  const sections = await db.homepageSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Homepage CMS</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Content blocks rendered on the homepage.
      </p>

      <div className="mt-8 space-y-5">
        {sections.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg">{s.title ?? s.key}</h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {s.key}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.isActive ? "gold" : "secondary"}>
                  {s.isActive ? "Active" : "Hidden"}
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/cms/${s.key}`}>
                    <Pencil className="size-3.5" /> Edit
                  </Link>
                </Button>
              </div>
            </div>
            <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-secondary/50 p-4 text-xs text-muted-foreground">
              {JSON.stringify(s.content, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
