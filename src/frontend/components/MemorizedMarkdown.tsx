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
      <div className="my-2 sm:my-4 rounded-md sm:rounded-lg overflow-hidden border-0 outline-0 w-full">
        <CopyClipBoard lang={lang} codeString={String(children)} />
<div className="w-screen -mx-4 sm:mx-0 sm:w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-track-transparent">
          <div className="min-w-[400px] sm:min-w-full">
            <ShikiHighlighter
              language={lang}
              theme="github-dark"
              className="text-[11px] sm:text-sm md:text-base font-mono block !bg-transparent min-w-full px-3 sm:px-4 lg:px-5 border-0 outline-0"
              showLanguage={false}
            >
              {String(children)}
            </ShikiHighlighter>
          </div>
        </div>
      </div>
    );
  }

  const inlineCodeClasses =
    size === "small"
      ? "mx-0.5 overflow-auto rounded px-1 py-0.5 bg-indigo-900/10 font-mono text-[11px] break-words"
      : "mx-0.5 overflow-auto rounded-md px-1 sm:px-1.5 xl:px-2 py-0.5 sm:py-1 bg-indigo-900/10 font-mono text-xs sm:text-sm lg:text-base break-words";

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
    } catch (error) {
      console.error("Unable to copy the code", error);
    }
  };

  return (
    <div className="flex justify-between items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-0 bg-indigo-400/30 text-foreground rounded-t-md border-b border-indigo-500/10">
      <span className="text-[11px] sm:text-sm lg:text-base font-mono truncate flex-1 mr-2 min-w-0">
        {lang}
      </span>
      <button
        onClick={copyToClipBoard}
        className="cursor-pointer p-2 sm:p-2.5 lg:p-3 hover:bg-black/20 active:bg-black/30 rounded transition-colors flex-shrink-0 touch-manipulation min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] lg:min-w-[40px] lg:min-h-[40px] flex items-center justify-center"
        aria-label={copy ? "Copied!" : "Copy code"}
      >
        {copy ? (
          <Check className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
        ) : (
          <Copy className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
        )}
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
        ? 'prose prose-sm dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-headings:break-words prose-p:break-words prose-headings:text-xs prose-p:text-xs prose-headings:leading-tight prose-p:leading-relaxed prose-ul:text-xs prose-ol:text-xs prose-li:text-xs'
        : 'prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert break-words max-w-none w-full prose-code:before:content-none prose-code:after:content-none prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-headings:break-words prose-p:break-words prose-headings:leading-tight prose-p:leading-relaxed prose-headings:text-sm prose-p:text-sm sm:prose-headings:text-base sm:prose-p:text-base lg:prose-headings:text-lg lg:prose-p:text-lg prose-ul:text-sm sm:prose-ul:text-base lg:prose-ul:text-lg prose-ol:text-sm sm:prose-ol:text-base lg:prose-ol:text-lg prose-li:text-sm sm:prose-li:text-base lg:prose-li:text-lg prose-table:text-xs sm:prose-table:text-sm lg:prose-table:text-base prose-th:text-xs sm:prose-th:text-sm lg:prose-th:text-base prose-td:text-xs sm:prose-td:text-sm lg:prose-td:text-base';

    return (
      <MarkDownComponent.Provider value={size}>
        <div className={`${proseClasses} px-1 sm:px-2 lg:px-4`}>
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