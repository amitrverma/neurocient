"use client";

import { useEffect } from "react";

interface InnerCavemanHighlighterProps {
  targetId: string;
}

const TARGET_PHRASE = "Inner Caveman";

function shouldSkipNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;

  if (parent.closest(".inner-caveman-mark")) return true;

  if (
    parent.closest(
      "h1, h2, h3, h4, h5, h6, code, pre, script, style, textarea, input, button"
    )
  ) {
    return true;
  }

  return false;
}

function wrapPhrase(node: Text) {
  const text = node.nodeValue || "";
  if (!text.includes(TARGET_PHRASE)) return;
  if (shouldSkipNode(node)) return;

  const parts = text.split(TARGET_PHRASE);
  if (parts.length < 2) return;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i]) fragment.appendChild(document.createTextNode(parts[i]));
    if (i < parts.length - 1) {
      const mark = document.createElement("span");
      mark.className = "inner-caveman-mark";
      mark.textContent = TARGET_PHRASE;
      fragment.appendChild(mark);
    }
  }

  node.parentNode?.replaceChild(fragment, node);
}

export default function InnerCavemanHighlighter({ targetId }: InnerCavemanHighlighterProps) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current as Text);
      current = walker.nextNode();
    }

    nodes.forEach(wrapPhrase);
  }, [targetId]);

  return null;
}

