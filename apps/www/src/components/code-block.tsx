"use client";

import { CopyButton } from "./copy-button";
import { codeToHtml } from "shiki";
import { useEffect, useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "typescript",
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    }).then(setHtml);
  }, [code, language]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <CopyButton text={code} />
        </div>
      )}
      <div className="relative">
        {!title && (
          <div className="absolute top-3 right-3 z-10">
            <CopyButton text={code} />
          </div>
        )}
        <div
          className="p-4 overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
