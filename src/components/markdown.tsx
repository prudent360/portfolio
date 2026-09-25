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
    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed prose-headings:font-display prose-headings:tracking-tight prose-a:text-accent prose-a:font-medium hover:prose-a:text-accent-dark prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl prose-img:border prose-img:border-slate-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children, ...props }) => {
            const rawText = extractText(children);
            const id = slugify(rawText);
            return (
              <h2
                id={id}
                className="group scroll-mt-24 mt-12 mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3 font-display text-2xl font-bold tracking-tight text-slate-900 md:text-[26px]"
                {...props}
              >
                <a
                  href={`#${id}`}
                  className="text-slate-300 transition-colors group-hover:text-accent no-underline font-normal text-lg"
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
                className="group scroll-mt-24 mt-8 mb-4 flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-slate-900"
                {...props}
              >
                <a
                  href={`#${id}`}
                  className="text-slate-300 transition-colors group-hover:text-accent no-underline font-normal text-base"
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
              className="my-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5 text-slate-700 italic border-l-4 border-l-accent text-[15.5px]"
              {...props}
            >
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
              <table className="w-full min-w-[500px] border-collapse text-left text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border-b border-slate-100 px-4 py-3 text-slate-600" {...props}>
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
                  className="rounded-md border border-slate-200/70 bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] font-medium text-slate-800"
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
