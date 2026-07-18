import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import Image from "next/image";

function isInternal(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

type CodeProps = ComponentPropsWithoutRef<"code"> & {
  "data-inline-code"?: string;
};

export const mdxComponents: MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mt-10 mb-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-8 mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
      {...props}
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4
      className="mt-6 mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-white"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="my-4 leading-7 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-4 list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="my-4 list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-7" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 w-full overflow-x-auto">
      <table
        className="w-full border-collapse text-sm text-left text-gray-700 dark:text-gray-300"
        {...props}
      />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead
      className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
      {...props}
    />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="border border-gray-200 dark:border-gray-700 px-3 py-2"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr
      className="my-8 border-gray-200 dark:border-gray-700"
      {...props}
    />
  ),
  a: ({ href = "#", ...rest }: ComponentPropsWithoutRef<"a">) => {
    if (isInternal(href)) {
      return (
        <Link
          href={href}
          className="text-blue-700 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
          {...rest}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
        {...rest}
      />
    );
  },
  img: ({ src, alt, width, height }: ComponentPropsWithoutRef<"img">) => {
    if (!src || typeof src !== "string") return null;
    return (
      <Image
        src={src}
        alt={alt ?? ""}
        width={typeof width === "number" ? width : 1024}
        height={typeof height === "number" ? height : 576}
        className="my-6 rounded-lg border border-gray-200 dark:border-gray-700"
      />
    );
  },
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-sm md:text-base leading-7"
      {...props}
    />
  ),
  code: (props: CodeProps) => {
    const isInline = "data-inline-code" in props;
    if (isInline) {
      return (
        <code
          className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.9em] text-gray-900 dark:text-gray-100"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
};
