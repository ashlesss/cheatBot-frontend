<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <h3>Streaming Markdown Renderer Example</h3>
      <p>
        This demonstrates how to use the StreamingMarkdown component with LLM
        streaming content.
      </p>
    </div>

    <div class="controls q-mb-md">
      <q-btn
        @click="startSimulatedStream"
        color="primary"
        :disable="isStreaming"
        label="Start Simulated Stream"
      />
      <q-btn
        @click="resetStream"
        color="secondary"
        class="q-ml-sm"
        label="Reset"
      />
      <q-btn
        @click="startRealStream"
        color="accent"
        class="q-ml-sm"
        :disable="isStreaming"
        label="Connect to Real LLM (Example)"
      />
    </div>

    <div class="debug-info q-mb-sm">
      <small>Content length: {{ streamedContent.length }} | Streaming: {{ isStreaming }}</small>
    </div>

    <div class="markdown-container">
      <StreamingMarkdown
        :content="streamedContent"
        :isStreaming="isStreaming"
        :debounceDelay="100"
      />
    </div>

    <q-separator class="q-my-lg" />

    <div class="code-example">
      <h4>How to use StreamingMarkdown component:</h4>
      <pre><code>{{ usageExample }}</code></pre>
    </div>
  </q-page>
</template>

<script>
import StreamingMarkdown from "../components/StreamingMarkdown.vue";

export default {
  name: "StreamingExample",

  components: {
    StreamingMarkdown,
  },

  data() {
    return {
      streamedContent: "",
      isStreaming: false,
      streamInterval: null,

      // Example markdown content to simulate streaming
      exampleContent: '# Streaming Markdown Example\n\n' +
'This is a demonstration of **streaming markdown** rendering.\n\n' +
'## Features\n\n' +
'- ✓ Real-time rendering as content arrives\n' +
'- ✓ Syntax highlighting for code blocks\n' +
'- ✓ Math equation support with KaTeX\n' +
'- ✓ Handles incomplete markdown gracefully\n\n' +
'### Code Example\n\n' +
'Here\'s a Python function:\n\n' +
'```python\n' +
'def fibonacci(n):\n' +
'    """Calculate the nth Fibonacci number."""\n' +
'    if n <= 1:\n' +
'        return n\n' +
'    return fibonacci(n-1) + fibonacci(n-2)\n\n' +
'# Usage\n' +
'result = fibonacci(10)\n' +
'print(f"The 10th Fibonacci number is: {result}")\n' +
'```\n\n' +
'### Math Support\n\n' +
'The quadratic formula is: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n\n' +
'For display math:\n\n' +
'$$\n' +
'\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n' +
'$$\n\n' +
'### Lists and Formatting\n\n' +
'1. **Bold text** for emphasis\n' +
'2. *Italic text* for subtle emphasis\n' +
'3. `Inline code` for technical terms\n' +
'4. [Links](https://example.com) for references\n\n' +
'> This is a blockquote. It can contain multiple lines\n' +
'> and is useful for highlighting important information.\n\n' +
'### Tables\n\n' +
'| Language | Type | Year |\n' +
'|----------|------|------|\n' +
'| Python | Dynamic | 1991 |\n' +
'| JavaScript | Dynamic | 1995 |\n' +
'| Rust | Static | 2010 |\n\n' +
'---\n\n' +
'**Stream complete!** 🎉',

      usageExample: `// Basic usage
<StreamingMarkdown
  :content="streamedContent"
  :isStreaming="isStreaming"
/>

// With custom debounce delay
<StreamingMarkdown
  :content="streamedContent"
  :isStreaming="isStreaming"
  :debounceDelay="100"
/>

// Example: Fetch API with streaming
async connectToLLM() {
  this.isStreaming = true;
  this.streamedContent = '';

  const response = await fetch('https://api.example.com/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Your prompt here' })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    this.streamedContent += chunk;  // Component auto-updates!
  }

  this.isStreaming = false;
}`,
    };
  },

  methods: {
    startSimulatedStream() {
      this.streamedContent = "";
      this.isStreaming = true;

      let currentIndex = 0;
      const chunkSize = 5; // Characters per chunk
      const intervalMs = 50; // Milliseconds between chunks

      this.streamInterval = setInterval(() => {
        if (currentIndex >= this.exampleContent.length) {
          this.isStreaming = false;
          clearInterval(this.streamInterval);
          console.log('Streaming complete!');
          return;
        }

        const chunk = this.exampleContent.slice(
          currentIndex,
          currentIndex + chunkSize
        );
        this.streamedContent += chunk;
        console.log(`Added chunk, new length: ${this.streamedContent.length}`);
        currentIndex += chunkSize;
      }, intervalMs);
    },

    resetStream() {
      if (this.streamInterval) {
        clearInterval(this.streamInterval);
      }
      this.streamedContent = "";
      this.isStreaming = false;
    },

    async startRealStream() {
      // Example implementation for connecting to a real LLM API
      // You'll need to replace this with your actual API endpoint

      this.$q.notify({
        message: "This is an example. Configure your LLM endpoint in the code.",
        color: "info",
        position: "top",
      });

      // Example using Fetch API with streaming
      /*
      try {
        this.isStreaming = true;
        this.streamedContent = '';

        const response = await fetch('YOUR_LLM_API_ENDPOINT', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY'
          },
          body: JSON.stringify({
            prompt: 'Explain quantum computing',
            stream: true
          })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            this.isStreaming = false;
            break;
          }

          const chunk = decoder.decode(value);

          // Parse SSE or JSON chunks depending on your API
          // Example for SSE format:
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                // Extract content based on your API response format
                const content = parsed.choices?.[0]?.delta?.content || '';
                this.streamedContent += content;
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        this.isStreaming = false;
        this.$q.notify({
          message: 'Error connecting to LLM API',
          color: 'negative',
          position: 'top'
        });
      }
      */
    },
  },

  beforeUnmount() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
    }
  },
};
</script>

<style scoped>
.debug-info {
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
  max-width: 900px;
}

.markdown-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
  min-height: 200px;
  max-width: 900px;
}

.code-example {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  max-width: 900px;
}

.code-example pre {
  margin: 0;
  overflow-x: auto;
}

.code-example code {
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  line-height: 1.4;
}

h3 {
  margin-top: 0;
  color: #1976d2;
}

h4 {
  margin-top: 0;
  margin-bottom: 10px;
}
</style>
