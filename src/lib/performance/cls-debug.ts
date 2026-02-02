/*
  CLS Debug Helper
  - Only runs when `?debugCls=1` is present in the URL.
  - Logs layout-shift entries + affected nodes to help pinpoint culprits.
  - No behavior changes for regular users.
*/

function getNodeHint(node: Node | null): string {
  if (!node || !(node instanceof Element)) return "(unknown)";

  const id = node.id ? `#${node.id}` : "";
  const className = typeof node.className === "string" && node.className.trim()
    ? `.${node.className.trim().split(/\s+/).slice(0, 4).join(".")}`
    : "";
  return `${node.tagName.toLowerCase()}${id}${className}`;
}

function isEnabled(): boolean {
  try {
    return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugCls") === "1";
  } catch {
    return false;
  }
}

if (typeof window !== "undefined" && isEnabled() && "PerformanceObserver" in window) {
  let totalCls = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEntry[]) {
      // LayoutShift entry type (TS doesn't include it in lib.dom by default)
      const shift = entry as any;
      if (!shift || shift.entryType !== "layout-shift") continue;
      if (shift.hadRecentInput) continue;

      totalCls += shift.value || 0;
      const sources = Array.isArray(shift.sources) ? shift.sources : [];

      const nodes = sources
        .map((s: any) => getNodeHint(s?.node ?? null))
        .filter(Boolean);

      // eslint-disable-next-line no-console
      console.log("[CLS]", {
        value: Number((shift.value || 0).toFixed(4)),
        total: Number(totalCls.toFixed(4)),
        nodes,
      });
    }
  });

  try {
    observer.observe({ type: "layout-shift", buffered: true } as any);
    // eslint-disable-next-line no-console
    console.log("[CLS] debug enabled. Add ?debugCls=1 to reproduce and watch console.");
  } catch {
    // ignore
  }
}

export {};
