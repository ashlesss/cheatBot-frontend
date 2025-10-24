<template>
  <div class="streaming-markdown-container" ref="mdRenderedContent">
    <div v-html="renderedContent" class="markdown-content"></div>
    <span v-if="isStreaming" class="cursor-blink">▊</span>
  </div>
</template>

<script>
import markdownRenderer from "../mixins/markdownRenderer.js";
import "highlight.js/styles/default.css";
import "../css/code-block.css";
import { scroll } from "quasar";
const { getScrollTarget, setVerticalScrollPosition } = scroll;

export default {
  name: "StreamingMarkdown",

  mixins: [markdownRenderer],

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

  beforeUnmount() {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }
  },

  methods: {
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
        // Use the mixin's md instance to render
        this.renderedContent = this.md.render(processedContent);

        // Auto scroll to the bottom
        this.scrollToBottom(this.$refs.mdRenderedContent);
      } catch (error) {
        console.warn("Markdown rendering error:", error);
        // Fallback: show content as-is if rendering fails
        this.renderedContent = `<pre>${this.escapeHtml(content)}</pre>`;
      }
    },

    preprocessStreamingContent(content) {
      // Handle incomplete code blocks by temporarily closing them
      // Count all ``` markers - should be even (open/close pairs)
      const allBlocks = (content.match(/```/g) || []).length;

      // If odd number of ```, we have an unclosed block
      if (allBlocks % 2 === 1) {
        return content + "\n```";
      }

      return content;
    },

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    scrollToBottom(el) {
      this.$nextTick(() => {
        // const target = getScrollTarget(this.$refs.mdRenderedContent);

        // console.log(
        //   "document.body.scrollHeight",
        //   document.body.scrollHeight,
        //   "target.scrollHeight",
        //   el.scrollHeight
        // );

        this.getGap();

        // if (el.scrollHeight + 1260 >= document.body.scrollHeight) {
        //   setVerticalScrollPosition(target, el.scrollHeight, 0);
        // }

        // Scroll the mdRenderedContent element itself to show the latest content
        // setVerticalScrollPosition(target, el.scrollHeight, 0);
      });
    },

    getGap() {
      const elEdge =
        this.$refs.mdRenderedContent.getBoundingClientRect().bottom;
      const innerHeight = window.innerHeight;
      console.log(
        "innerHeight",
        innerHeight,
        "elEdge",
        elEdge,
        "distance",
        innerHeight - elEdge
      );

      const target = document.documentElement;
      const currentScroll = target.scrollTop;

      if (elEdge >= innerHeight) {
        const newScroll = currentScroll + (elEdge - innerHeight);
        setVerticalScrollPosition(target, newScroll, 0);
      }
    },
  },

  // created() {
  //   this.getGap();
  // },
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

/* Code block styling is now in code-block.css */

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
