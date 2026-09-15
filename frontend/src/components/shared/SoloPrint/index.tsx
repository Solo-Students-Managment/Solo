import {
  resolvePrintPageClass,
  type PrintDocumentState,
  type PrintLayout,
} from "./model";

type SoloPrintPreviewProps = {
  layout?: PrintLayout;
  state?: PrintDocumentState;
  title: string;
  children: React.ReactNode;
};

export function SoloPrintPreview({
  layout = "a4-portrait",
  state = "ready",
  title,
  children,
}: SoloPrintPreviewProps) {
  if (state === "preparing") {
    return <p role="status">Preparing document…</p>;
  }
  if (state === "failed") {
    return (
      <p role="alert" className="text-danger">
        Document preview failed
      </p>
    );
  }

  return (
    <article
      className={`bg-elevated border-border mx-auto max-w-3xl border p-8 ${resolvePrintPageClass(layout)}`}
      aria-label={title}
    >
      <h1 className="font-display mb-4 text-2xl font-semibold">{title}</h1>
      {children}
      <p className="text-muted mt-6 text-xs">
        Browser print is preview-only. Official PDF is a future backend
        contract.
      </p>
    </article>
  );
}

export * from "./model";
