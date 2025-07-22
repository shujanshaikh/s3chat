import { ChevronDown, Globe } from "lucide-react";

export const ToolCall = ({
  toolName,
  result,
  args,
}: {
  toolName: string;
  result?: string;
  args: Record<string, unknown>;
}) => {
  if (toolName === "webSearch") {
    return (
      <div className="my-4">
        {result ? (
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-3 p-2 transition-colors">
              <Globe className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-300">Searched the web</span>
              <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 ml-8 space-y-3">
              {JSON.parse(result).map(
                (
                  item: { url: string; title: string; content: string },
                  i: number
                ) => (
                  <div key={i} className="group/item">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-4 w-4 items-center justify-center rounded bg-gray-700">
                        <div className="h-2 w-2 rounded bg-gray-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline truncate"
                          title={item.title}
                        >
                          {item.title}
                        </a>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {new URL(item.url).hostname}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </details>
        ) : (
          <div className="flex items-center gap-3 p-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            <span className="text-sm text-gray-400">Searching the web...</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};
