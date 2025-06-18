import { Check, Copy } from "lucide-react";
import {
  ComponentProps,
  createContext,
  memo,
  useContext,
  useMemo,
  useState,
} from "react";
import { type Components, ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ShikiHighlighter from "react-shiki";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";
import { toast, Toaster } from "sonner";

type MarkDownSize = "small" | "default";

type CodeComponentsProps = ComponentProps<"code"> & ExtraProps;
const MarkDownComponent = createContext<MarkDownSize>("default");

const components: Components = {
  code: CodeBlock as Components["code"],
  pre: ({ children }) => <>{children}</>,
};

function CodeBlock({ children, className, ...props }: CodeComponentsProps) {
  const size = useContext(MarkDownComponent);
  const langMatch = /language-(\w+)/.exec(className || "");

  if (langMatch) {
    const lang = langMatch[1];
    return (
      <div className="overflow-hidden rounded-md sm:rounded-lg my-2 sm:my-4 max-w-full" style={{ border: 'none', outline: 'none' }}>
        <CopyClipBoard lang={lang} codeString={String(children)} />
        <div className="overflow-x-auto" style={{ border: 'none', outline: 'none', borderRadius: '0', padding: '0', margin: '0' }}>
          <ShikiHighlighter
            language={lang}
            theme={"plastic"}
            className="text-xs sm:text-sm font-mono block !bg-transparent min-w-full"
            showLanguage={false}
            style={{ 
              border: 'none', 
              outline: 'none', 
              borderRadius: '0',
              padding: '12px 16px',
              margin: '0'
            }}
          >
            {String(children)}
          </ShikiHighlighter>
        </div>
      </div>
    );
  }

  const inlineCodeClasses =
    size === "small"
      ? "mx-0.5 overflow-auto rounded px-1 py-0.5 bg-pink-900/15 font-mono text-xs break-all"
      : "mx-0.5 overflow-auto rounded-md px-1 sm:px-1.5 xl:px-2 py-0.5 sm:py-1 bg-pink-900/10 font-mono text-xs sm:text-sm break-all";

  return (
    <code className={inlineCodeClasses} {...props}>
      {children}
    </code>
  );
}

function CopyClipBoard({
  lang,
  codeString,
}: {
  lang: string;
  codeString: string;
}) {
  const [copy, setCopy] = useState(false);

  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopy(true);
      toast.success("Copied to clipboard");
      setTimeout(() => {
        setCopy(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy the code", error);
    }
  };

  return (
      <div className="flex justify-between items-center px-2 sm:px-3 xl:px-4 py-2 sm:py-2.5 xl:py-3 bg-pink-500/10 text-foreground rounded-t-md border-b border-pink-500/10">
      <span className="text-xs sm:text-sm font-mono truncate flex-1 mr-2">{lang}</span>
      <button 
        onClick={copyToClipBoard} 
        className="text-xs sm:text-sm cursor-pointer p-1 sm:p-1.5 hover:bg-black/20 rounded transition-colors flex-shrink-0 touch-manipulation"
        aria-label={copy ? "Copied!" : "Copy code"}
      >
        {copy ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
        <Toaster position="bottom-center" richColors={false} duration={2000} />
      </button>
    </div>
  );
}

function parsedMarkDownintoBlocksa(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((t) => t.raw);
}

function PureMarkdownRendererBlock({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath]]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

const MarkDownBlock = memo(
  PureMarkdownRendererBlock,
  (prevBlock, nextBlock) => {
    if (prevBlock.content !== nextBlock.content) return false;
    return true;
  }
);

MarkDownBlock.displayName = "MarkdownRendererBlock";

const MemoizedMarkdown = memo(
  ({
    content,
    id,
    size = 'default',
  }: {
    content: string;
    id: string;
    size?: MarkDownSize;
  }) => {
    const blocks = useMemo(() => parsedMarkDownintoBlocksa(content), [content]);

    const proseClasses =
      size === 'small'
        ? 'prose prose-sm dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-headings:break-words prose-p:break-words prose-headings:text-sm prose-p:text-sm prose-headings:leading-tight prose-p:leading-relaxed'
        : 'prose prose-sm sm:prose-base dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-headings:break-words prose-p:break-words prose-headings:leading-tight prose-p:leading-relaxed prose-headings:text-sm prose-p:text-sm sm:prose-headings:text-base sm:prose-p:text-base prose-ul:text-sm sm:prose-ul:text-base prose-ol:text-sm sm:prose-ol:text-base prose-li:text-sm sm:prose-li:text-base';

    return (
      <MarkDownComponent.Provider value={size}>
        <div className={proseClasses}>
          {blocks.map((block, index) => (
            <MarkDownBlock
              content={block}
              key={`${id}-block-${index}`}
            />
          ))}
        </div>
      </MarkDownComponent.Provider>
    );
  }
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';

export default MemoizedMarkdown;