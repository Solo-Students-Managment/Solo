"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Button } from "@/components/ui";

import { sanitizeHtml } from "./sanitize";

type SoloContentEditorProps = {
  initialHtml?: string;
  onChange?: (html: string) => void;
};

export function SoloContentEditor({
  initialHtml = "<p></p>",
  onChange,
}: SoloContentEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: sanitizeHtml(initialHtml),
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange?.(sanitizeHtml(current.getHTML()));
    },
  });

  return (
    <div className="border-border bg-elevated space-y-2 rounded-md border p-3">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose min-h-32 max-w-none text-sm outline-none"
      />
    </div>
  );
}

export { sanitizeHtml } from "./sanitize";
