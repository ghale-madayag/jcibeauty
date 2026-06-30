"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";

/** A table row that navigates to `href` on click or Enter. */
export function ClickableRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <TableRow
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      tabIndex={0}
      className="cursor-pointer transition-colors hover:bg-secondary/60"
    >
      {children}
    </TableRow>
  );
}
