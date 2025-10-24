<template>
  <div class="code-block-container" :class="{ 'with-copy': showCopyButton }">
    <div v-if="language" class="language-label">
      {{ language }}
    </div>

    <button
      v-if="showCopyButton"
      class="copy-button"
      @click="copyCode"
      :class="{ copied: isCopied }"
    >
      {{ isCopied ? "Copied!" : "Copy" }}
    </button>

    <pre :class="preClass"><code
      :class="codeClass"
      v-html="highlightedCode"
    ></code></pre>
  </div>
</template>

<script>
import hljs from "highlight.js";

export default {
  name: "CodeBlock",

  props: {
    // The code content to display
    code: {
      type: String,
      required: true,
    },
    // Programming language for syntax highlighting
    language: {
      type: String,
      default: "",
    },
    // Show copy button
    showCopyButton: {
      type: Boolean,
      default: true,
    },
    // Custom CSS class for the <pre> element
    preClass: {
      type: String,
      default: "",
    },
    // Custom CSS class for the <code> element
    codeClass: {
      type: String,
      default: "",
    },
    // Auto-detect language if not specified
    autoDetect: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isCopied: false,
      copyTimeout: null,
    };
  },

  computed: {
    highlightedCode() {
      if (!this.code) return "";

      try {
        if (this.language && hljs.getLanguage(this.language)) {
          // Highlight with specified language
          return hljs.highlight(this.code, { language: this.language }).value;
        } else if (this.autoDetect) {
          // Auto-detect language
          return hljs.highlightAuto(this.code).value;
        } else {
          // No highlighting, just escape HTML
          return this.escapeHtml(this.code);
        }
      } catch (error) {
        console.warn("Syntax highlighting error:", error);
        return this.escapeHtml(this.code);
      }
    },
  },

  beforeUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  },

  methods: {
    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.code);
        this.isCopied = true;

        // Reset after 2 seconds
        if (this.copyTimeout) {
          clearTimeout(this.copyTimeout);
        }
        this.copyTimeout = setTimeout(() => {
          this.isCopied = false;
        }, 2000);

        this.$emit("copied", this.code);
      } catch (error) {
        console.error("Failed to copy code:", error);
        this.$emit("copy-error", error);
      }
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
.code-block-container {
  position: relative;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  overflow: auto;
}

.language-label {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #000;
  color: #fff;
  padding: 2px 8px 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-bottom-left-radius: 4px;
  text-transform: uppercase;
  user-select: none;
  z-index: 1;
}

.copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  opacity: 0.7;
}

.code-block-container:hover .copy-button {
  opacity: 1;
}

.copy-button:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.copy-button:active {
  transform: scale(0.95);
}

.copy-button.copied {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

/* Adjust copy button position when language label exists */
.code-block-container.with-copy .language-label {
  right: auto;
  left: 0;
  border-radius: 0;
  border-bottom-right-radius: 4px;
}

.code-block-container pre {
  margin: 0;
  margin-top: 24px;
  padding: 0;
  background-color: transparent;
  overflow: visible;
}

.code-block-container code {
  font-family: "Courier New", Courier, Monaco, monospace;
  font-size: 14px;
  line-height: 1.5;
  display: block;
  white-space: pre;
}

/* Syntax highlighting theme adjustments */
.code-block-container :deep(.hljs) {
  background: transparent;
  padding: 0;
}

.code-block-container :deep(.hljs-comment),
.code-block-container :deep(.hljs-quote) {
  color: #6a737d;
  font-style: italic;
}

.code-block-container :deep(.hljs-keyword),
.code-block-container :deep(.hljs-selector-tag),
.code-block-container :deep(.hljs-type) {
  color: #d73a49;
  font-weight: 600;
}

.code-block-container :deep(.hljs-string),
.code-block-container :deep(.hljs-attr) {
  color: #032f62;
}

.code-block-container :deep(.hljs-number),
.code-block-container :deep(.hljs-literal),
.code-block-container :deep(.hljs-variable),
.code-block-container :deep(.hljs-template-variable) {
  color: #005cc5;
}

.code-block-container :deep(.hljs-function),
.code-block-container :deep(.hljs-title) {
  color: #6f42c1;
}

.code-block-container :deep(.hljs-params) {
  color: #24292e;
}

.code-block-container :deep(.hljs-built_in) {
  color: #e36209;
}
</style>
