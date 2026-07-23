import { visit } from "unist-util-visit";
import type { Root, Element, ElementContent } from "hast";

function isMermaidCodeBlock(node: Element): boolean {
  if (node.tagName !== "code") return false;
  const className = node.properties?.className;
  const classes = Array.isArray(className) ? className : [];
  return classes.includes("language-mermaid");
}

function extractText(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    return node.children.map(extractText).join("");
  }
  return "";
}

export function rehypeMermaidBlock() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const codeNode = node.children.find(
        (child): child is Element =>
          child.type === "element" && isMermaidCodeBlock(child)
      );
      if (!codeNode) return;

      const source = extractText(codeNode).replace(/\n$/, "");
      const replacement: Element = {
        type: "element",
        tagName: "div",
        properties: { "data-mermaid-source": source },
        children: [],
      };
      parent.children[index] = replacement;
    });
  };
}
