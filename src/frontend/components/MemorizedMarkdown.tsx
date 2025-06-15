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
      <div className="overflow-hidden rounded-md" style={{ border: 'none', outline: 'none' }}>
        <CopyClipBoard lang={lang} codeString={String(children)} />
        <div style={{ border: 'none', outline: 'none', borderRadius: '0', padding: '0', margin: '0' }}>
          <ShikiHighlighter
            language={lang}
            theme={"rose-pine"}
            className="text-sm font-mono block"
            showLanguage={false}
            style={{ 
              border: 'none', 
              outline: 'none', 
              borderRadius: '0',
              padding: '16px',
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
      ? "mx-0.5 overflow-auto rounded-md px-1 py-0.5 bg-[#51495f] font-mono text-xs"
      : "mx-0.5 overflow-auto rounded-md px-2 py-1 bg-[#51495f] font-mono";

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
      setInterval(() => {
        
        setCopy(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy the code", error);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-[#51495f] text-foreground rounded-t-md">
      <span className="text-sm font-mono">{lang}</span>
      <button onClick={copyToClipBoard} className="text-sm cursor-pointer">
        {copy ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
      ? 'prose prose-sm dark:prose-invert bread-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none'
      : 'prose prose-base dark:prose-invert bread-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none';

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
  