import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import type { ReactElement } from "react";
import { mdxComponents } from "./components";
import { rehypeMermaidBlock } from "./rehype-mermaid-block";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
  defaultLang: "plaintext",
};

export async function renderMdx(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeMermaidBlock,
          [rehypePrettyCode, prettyCodeOptions],
          rehypeKatex,
        ],
      },
    },
  });
  return content;
}
