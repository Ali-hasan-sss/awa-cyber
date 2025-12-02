"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(
  () => {
    // Import CSS when component loads
    if (typeof window !== "undefined") {
      require("react-quill/dist/quill.snow.css");
    }
    return import("react-quill");
  },
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className = "",
}: RichTextEditorProps) {
  const { locale } = useLanguage();
  const isRTL = locale === "ar";

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ align: [] }],
        ["link", "image", "video"],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "video",
    "color",
    "background",
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-family: inherit;
          font-size: 14px;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          color: rgb(241, 245, 249);
          min-height: 200px;
        }

        .rich-text-editor .ql-container.ql-snow {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: none;
          background: rgba(255, 255, 255, 0.05);
        }

        .rich-text-editor .ql-toolbar.ql-snow {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: none;
        }

        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: rgb(241, 245, 249);
        }

        .rich-text-editor .ql-toolbar .ql-fill {
          fill: rgb(241, 245, 249);
        }

        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button:focus,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: rgb(34, 211, 238);
        }

        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: rgb(34, 211, 238);
        }

        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button:focus .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: rgb(34, 211, 238);
        }

        .rich-text-editor .ql-editor {
          min-height: 200px;
          color: rgb(241, 245, 249);
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.4);
          font-style: normal;
        }

        .rich-text-editor .ql-picker-label {
          color: rgb(241, 245, 249);
        }

        .rich-text-editor .ql-picker-options {
          background: rgb(6, 14, 31);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgb(241, 245, 249);
        }

        .rich-text-editor .ql-picker-item:hover {
          color: rgb(34, 211, 238);
        }

        .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: rgba(255, 255, 255, 0.1);
        }

        ${isRTL
          ? `
        .rich-text-editor .ql-editor {
          direction: rtl;
          text-align: right;
        }
        .rich-text-editor .ql-toolbar {
          direction: rtl;
        }
      `
          : `
        .rich-text-editor .ql-editor {
          direction: ltr;
          text-align: left;
        }
        .rich-text-editor .ql-toolbar {
          direction: ltr;
        }
      `}
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          direction: isRTL ? "rtl" : "ltr",
        }}
      />
    </div>
  );
}
