import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/toc";
import { CodeBlock } from "@/components/blog/code-block";

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

/** Renders trusted-author Markdown with matching heading IDs and high-contrast code blocks. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-lg prose-slate max-w-none text-body leading-relaxed prose-headings:font-display prose-headings:tracking-tight prose-a:text-accent prose-a:font-medium hover:prose-a:text-accent-dark prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl prose-img:border prose-img:border-edge">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children, ...props }) => {
            const rawText = extractText(children);
            const id = slugify(rawText);
            return (
              <h2
                id={id}
                className="group scroll-mt-24 mt-12 mb-5 flex items-center gap-2.5 border-b border-line pb-3 font-display text-2xl font-semibold tracking-tight text-ink md:text-[26px]"
                {...props}
              >
                <a
                  href={`#${id}`}
                  className="text-edge-strong transition-colors group-hover:text-accent no-underline font-normal text-lg"
                  aria-label={`Link to ${rawText}`}
                >
                  #
                </a>
                <span>{children}</span>
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const rawText = extractText(children);
            const id = slugify(rawText);
            return (
              <h3
                id={id}
                className="group scroll-mt-24 mt-8 mb-4 flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink"
                {...props}
              >
                <a
                  href={`#${id}`}
                  className="text-edge-strong transition-colors group-hover:text-accent no-underline font-normal text-base"
                  aria-label={`Link to ${rawText}`}
                >
                  #
                </a>
                <span>{children}</span>
              </h3>
            );
          },
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="my-6 rounded-xl border border-edge bg-accent-soft/60 p-5 text-body italic border-l-4 border-l-accent text-[15.5px]"
              {...props}
            >
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-edge ">
              <table className="w-full min-w-[500px] border-collapse text-left text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border-b border-edge bg-panel px-4 py-3 font-semibold text-ink" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border-b border-line px-4 py-3 text-body" {...props}>
              {children}
            </td>
          ),
          // Unwrap default <pre> container so CodeBlock handles its own wrapper cleanly
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            const codeString = extractText(children);
            const isMultiLine = codeString.includes("\n");
            const hasLang = Boolean(className && className.includes("language-"));

            if (!hasLang && !isMultiLine) {
              return (
                <code
                  className="rounded-md border border-edge bg-accent-soft px-1.5 py-0.5 font-mono text-[13px] font-medium text-ink"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
