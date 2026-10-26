import { useState } from "react";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "./Icon";

export type CodeSnippet = {
  title: string;
  text: string;
  code: string;
};

export function CodeSnippets({ items }: { items: CodeSnippet[] }) {
  return (
    <section className="mt-5" aria-label="Code snippets">
      <h2>Snippets</h2>
      <p className="text-body-secondary">
        Patterns from this page, written the way a CRM screen uses them.
      </p>
      {items.map((item) => (
        <SnippetCard key={item.title} item={item} />
      ))}
    </section>
  );
}

function SnippetCard({ item }: { item: CodeSnippet }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(item.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex align-items-start gap-3 mb-2">
          <div className="me-auto">
            <h3 className="h5 mb-1">{item.title}</h3>
            <p className="text-body-secondary mb-0">{item.text}</p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary flex-shrink-0"
            onClick={() => void copy()}
          >
            <Icon icon={copied ? faCheck : faCopy} className="me-1" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="bg-body-secondary rounded p-3 small mb-0 overflow-auto">
          <code>{item.code}</code>
        </pre>
      </div>
    </div>
  );
}
