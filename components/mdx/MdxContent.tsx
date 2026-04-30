import "katex/dist/katex.min.css";
import { renderMdx } from "@/lib/mdx/compile";

interface MdxContentProps {
  source: string;
}

export async function MdxContent({ source }: MdxContentProps) {
  const content = await renderMdx(source);
  return (
    <div className="mdx-content text-base text-gray-700 dark:text-gray-300">
      {content}
    </div>
  );
}
