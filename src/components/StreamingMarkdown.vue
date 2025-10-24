<template>
  <div class="streaming-markdown-container">
    <div v-html="renderedContent" class="markdown-content"></div>
    <span v-if="isStreaming" class="cursor-blink">▊</span>
  </div>
</template>

<script>
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import tm from "markdown-it-texmath";
import katex from "katex";
import "highlight.js/styles/default.css";

export default {
  name: "StreamingMarkdown",

  props: {
    // The streaming content - can be updated incrementally
    content: {
      type: String,
      default: "",
    },
    // Indicates if content is still streaming
    isStreaming: {
      type: Boolean,
      default: false,
    },
    // Debounce delay in ms for re-rendering (performance optimization)
    debounceDelay: {
      type: Number,
      default: 50,
    },
  },

  data() {
    return {
      md: null,
      renderedContent: "",
      renderTimer: null,
      lastRenderTime: 0,
    };
  },

  watch: {
    content: {
      handler(newContent) {
        // console.log("Content changed, length:", newContent.length);
        this.throttledRender(newContent);
      },
      immediate: true,
    },
    isStreaming: {
      handler(newValue) {
        // When streaming stops, do a final render
        if (!newValue && this.content) {
          if (this.renderTimer) {
            clearTimeout(this.renderTimer);
          }
          this.renderMarkdown(this.content);
        }
      },
    },
  },

  created() {
    this.initializeMarkdown();
  },

  beforeUnmount() {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }
  },

  methods: {
    initializeMarkdown() {
      // Initialize markdown-it with syntax highlighting
      this.md = new MarkdownIt({
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(str, { language: lang }).value;
            } catch (__) {
              console.error(__);
            }
          }
          return "";
        },
      });

      // Add KaTeX support for math rendering
      this.md.use(tm, {
        engine: katex,
        delimiters: "dollars",
        katexOptions: { macros: { "\\RR": "\\mathbb{R}" } },
      });

      // Custom fence renderer for code blocks with language labels
      const defaultFenceRenderer = this.md.renderer.rules.fence;
      this.md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const info = token.info
          ? this.md.utils.unescapeAll(token.info).trim()
          : "";
        const langName = info ? info.split(/\s+/g)[0] : "";

        let result = defaultFenceRenderer(tokens, idx, options, env, self);

        if (langName) {
          result = `<div class="my-code-block">
            <div class="language-label">${langName}</div>
            ${result}
          </div>`;
        }

        return result;
      };
    },

    throttledRender(content) {
      const now = Date.now();
      const timeSinceLastRender = now - this.lastRenderTime;

      // If enough time has passed, render immediately
      if (timeSinceLastRender >= this.debounceDelay) {
        // console.log("Rendering markdown immediately, length:", content.length);
        this.lastRenderTime = now;
        this.renderMarkdown(content);
      } else {
        // Otherwise, schedule a render for later
        if (this.renderTimer) {
          clearTimeout(this.renderTimer);
        }

        const delay = this.debounceDelay - timeSinceLastRender;
        this.renderTimer = setTimeout(() => {
          // console.log(
          //   "Rendering markdown (throttled), length:",
          //   content.length
          // );
          this.lastRenderTime = Date.now();
          this.renderMarkdown(content);
        }, delay);
      }
    },

    renderMarkdown(content) {
      if (!content) {
        this.renderedContent = "";
        return;
      }

      try {
        // Handle incomplete code blocks during streaming
        const processedContent = this.preprocessStreamingContent(content);
        this.renderedContent = this.md.render(processedContent);
      } catch (error) {
        console.warn("Markdown rendering error:", error);
        // Fallback: show content as-is if rendering fails
        this.renderedContent = `<pre>${this.escapeHtml(content)}</pre>`;
      }
    },

    preprocessStreamingContent(content) {
      // Handle incomplete code blocks by temporarily closing them
      const codeBlockRegex = /```(\w+)?\n/g;
      const matches = content.match(codeBlockRegex) || [];
      const openBlocks = matches.length;

      // Count closing blocks
      const closingBlocks = (content.match(/```\s*$/gm) || []).length;

      // If we have unclosed code blocks, temporarily close them
      if (openBlocks > closingBlocks) {
        const unclosedCount = openBlocks - closingBlocks;
        return content + "\n" + "```".repeat(unclosedCount);
      }

      return content;
    },

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },
  },
};
</script>

<style scoped>
.streaming-markdown-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.markdown-content {
  font-size: 20px;
  line-height: 1.6;
}

/* Blinking cursor for streaming indicator */
.cursor-blink {
  display: inline-block;
  width: 10px;
  height: 1em;
  background-color: currentColor;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  50.1%,
  100% {
    opacity: 0;
  }
}

/* Code block styling */
.markdown-content :deep(.my-code-block) {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  overflow: auto;
  position: relative;
}

.markdown-content :deep(.language-label) {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #000;
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  border-bottom-left-radius: 4px;
}

.markdown-content :deep(pre) {
  margin: 0;
  background-color: transparent;
}

.markdown-content :deep(code) {
  font-family: "Courier New", Courier, monospace;
}

/* Math equation styling */
.markdown-content :deep(.katex) {
  font-size: 1.1em;
  background-color: #fffacd;
  padding: 2px 4px;
}

/* Standard markdown elements */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-content :deep(p) {
  margin-bottom: 1em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-content :deep(table th),
.markdown-content :deep(table td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-content :deep(table th) {
  background-color: #f5f5f5;
  font-weight: bold;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-content :deep(a) {
  color: #1976d2;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}
</style>
