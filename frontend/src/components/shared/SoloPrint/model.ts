export type PrintLayout =
  "a4-portrait" | "a4-landscape" | "certificate" | "invoice" | "report";

export type PrintDocumentState = "preparing" | "ready" | "failed";

export function resolvePrintPageClass(layout: PrintLayout): string {
  switch (layout) {
    case "a4-landscape":
      return "print-a4-landscape";
    case "certificate":
      return "print-certificate";
    case "invoice":
      return "print-invoice";
    case "report":
      return "print-report";
    default:
      return "print-a4-portrait";
  }
}
