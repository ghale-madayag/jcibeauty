"use client";

import * as React from "react";

/** Returns true after the component has mounted (client-only guard). */
export function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}
