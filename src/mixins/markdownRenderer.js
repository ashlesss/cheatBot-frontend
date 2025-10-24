import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import tm from "markdown-it-texmath";
import katex from "katex";
import escape from "lodash.escape";
import { scroll } from "quasar";
const { getScrollTarget, setVerticalScrollPosition } = scroll;

/**
 * Markdown renderer mixin for Vue components
 * Provides a configured markdown-it instance with syntax highlighting and math support
 */
export default {
  data() {
    return {
      md: null,
    };
  },

  created() {
    this.initializeMarkdown();
  },

  methods: {
    /**
     * Initialize the markdown-it parser with custom configuration
     */
    initializeMarkdown() {
      // Initialize markdown-it with syntax highlighting
      this.md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: (str, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(str, { language: lang }).value;
            } catch (error) {
              console.warn("Highlight.js error:", error);
            }
          }
          return ""; // Use default escaping
        },
      });

      // Add KaTeX support for math rendering
      this.md.use(tm, {
        engine: katex,
        delimiters: "dollars",
        katexOptions: {
          macros: { "\\RR": "\\mathbb{R}" },
          throwOnError: false,
        },
      });

      // Custom fence renderer for code blocks with language labels
      this.setupCustomFenceRenderer();
    },

    /**
     * Setup custom fence renderer for code blocks
     * Adds language labels and copy buttons to code blocks
     */
    setupCustomFenceRenderer() {
      this.md.renderer.rules.fence = (tokens, idx) => {
        const token = tokens[idx];
        const info = token.info
          ? this.md.utils.unescapeAll(token.info).trim()
          : "";
        const langName = info ? info.split(/\s+/g)[0] : "";
        const codeContent = token.content;

        // Apply syntax highlighting
        let highlightedCode = "";
        if (langName && this.md.options.highlight) {
          highlightedCode =
            this.md.options.highlight(codeContent, langName) ||
            this.escapeHtml(codeContent);
        } else {
          highlightedCode = this.escapeHtml(codeContent);
        }

        // Escape code for data attribute
        const escapedCode = escape(codeContent);

        // Build the complete code block HTML
        const result = `<div class="code-block-wrapper" data-language="${langName}" data-code="${escapedCode}">
          ${
            langName ? `<div class="code-language-label">${langName}</div>` : ""
          }
          <button class="code-copy-button" onclick="copyCodeBlock(this)" title="Copy code">
            <span class="copy-text">Copy</span>
            <span class="copied-text" style="display: none;">Copied!</span>
          </button>
          <div class="code-content">
            <pre><code class="${
              langName ? "language-" + langName : ""
            }">${highlightedCode}</code></pre>
          </div>
        </div>`;

        return result;
      };
    },

    /**
     * Escape HTML attributes to prevent XSS
     */
    escapeHtmlAttribute(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    /**
     * Render markdown content to HTML
     */
    renderMarkdown(content) {
      if (!content) return "";

      try {
        return this.md.render(content);
      } catch (error) {
        console.error("Markdown rendering error:", error);
        return `<pre>${this.escapeHtml(content)}</pre>`;
      }
    },

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    // scrollToBottom(el) {
    //   this.$nextTick(() => {
    //     const target = getScrollTarget(el);
    //     const scrollHeight = setVerticalScrollPosition(target);
    //     console.log(scrollHeight);
    //     setVerticalScrollPosition(target, scrollHeight);
    //   });
    // },
  },
};

/**
 * Global function for copy button functionality
 * Attached to window for use in v-html rendered content
 */
if (typeof window !== "undefined") {
  window.copyCodeBlock = function (button) {
    const wrapper = button.closest(".code-block-wrapper");
    if (!wrapper) return;

    const code = wrapper.getAttribute("data-code");
    if (!code) return;

    // Decode HTML entities
    const decodedCode = decodeHtmlEntities(code);

    navigator.clipboard
      .writeText(decodedCode)
      .then(() => {
        // Show "Copied!" text
        const copyText = button.querySelector(".copy-text");
        const copiedText = button.querySelector(".copied-text");

        if (copyText) copyText.style.display = "none";
        if (copiedText) copiedText.style.display = "inline";

        button.classList.add("copied");

        // Reset after 2 seconds
        setTimeout(() => {
          if (copyText) copyText.style.display = "inline";
          if (copiedText) copiedText.style.display = "none";
          button.classList.remove("copied");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy code:", err);
      });
  };

  function decodeHtmlEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }
}
