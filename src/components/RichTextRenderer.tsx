import { useEffect, useState } from "react";
import { convertFileSrc, isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type RichTextRendererProps = {
  /** Markdown / LaTeX / HTML textual de la cara de la tarjeta. */
  content: string;
  className?: string;
};

const MEDIA_PREFIX = "media/";
const IMG_CLASS = "my-3 max-w-full rounded-md shadow-md";

/**
 * Motor de renderizado premium para flashcards:
 * Markdown (GFM) + bloques de código + ecuaciones KaTeX +
 * imágenes locales bajo `$APPDATA/media/` vía `convertFileSrc`.
 */
export default function RichTextRenderer({
  content,
  className,
}: RichTextRendererProps) {
  const [appDataPath, setAppDataPath] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isTauri()) {
      setAppDataPath(null);
      return;
    }

    void appDataDir()
      .then((dir) => {
        if (!cancelled) setAppDataPath(dir);
      })
      .catch((error) => {
        console.error(
          "[RichTextRenderer] No se pudo resolver AppData:",
          error,
        );
        if (!cancelled) setAppDataPath(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={[
        "rich-text max-w-none text-inherit",
        "[&_p]:my-2 [&_p]:leading-relaxed",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-left",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-left",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_strong]:font-semibold [&_strong]:text-neutral-50",
        "[&_em]:italic",
        "[&_.katex]:text-[1.05em] [&_.katex-display]:my-3 [&_.katex-display]:overflow-x-auto",
        className ?? "",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ src, alt }) => (
            <VaultAwareImage src={src} alt={alt} appDataPath={appDataPath} />
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 text-left font-mono text-sm leading-relaxed text-neutral-200">
              {children}
            </pre>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock = Boolean(codeClassName);
            if (isBlock) {
              return (
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-200"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

type VaultAwareImageProps = {
  src?: string;
  alt?: string;
  appDataPath: string | null;
};

/**
 * Resuelve `media/...` contra AppData + `convertFileSrc`.
 * URLs remotas/data/blob se dejan tal cual.
 */
function VaultAwareImage({ src, alt, appDataPath }: VaultAwareImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!src) {
        setResolvedSrc(undefined);
        return;
      }

      if (!src.startsWith(MEDIA_PREFIX)) {
        setResolvedSrc(src);
        return;
      }

      if (!appDataPath || !isTauri()) {
        setResolvedSrc(undefined);
        return;
      }

      try {
        const absolute = await join(appDataPath, src);
        if (cancelled) return;
        setResolvedSrc(convertFileSrc(absolute));
      } catch (error) {
        console.error(
          "[RichTextRenderer] No se pudo convertir src de media local:",
          src,
          error,
        );
        if (!cancelled) setResolvedSrc(undefined);
      }
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [src, appDataPath]);

  if (!resolvedSrc) return null;

  return (
    <img
      src={resolvedSrc}
      alt={alt ?? ""}
      className={IMG_CLASS}
      loading="lazy"
    />
  );
}
