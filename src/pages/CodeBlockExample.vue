<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <h3>CodeBlock Component Example</h3>
      <p>Standalone code block component with syntax highlighting and copy button.</p>
    </div>

    <div class="examples">
      <h4>Example 1: Python Code</h4>
      <CodeBlock
        :code="pythonCode"
        language="python"
        @copied="onCopied"
      />

      <h4>Example 2: JavaScript Code</h4>
      <CodeBlock
        :code="javascriptCode"
        language="javascript"
      />

      <h4>Example 3: No Language (Plain Text)</h4>
      <CodeBlock
        :code="plainText"
        :showCopyButton="false"
      />

      <h4>Example 4: Auto-detect Language</h4>
      <CodeBlock
        :code="autoDetectCode"
        :autoDetect="true"
      />

      <h4>Example 5: JSON with Custom Classes</h4>
      <CodeBlock
        :code="jsonCode"
        language="json"
        preClass="custom-pre"
        codeClass="custom-code"
      />
    </div>

    <q-separator class="q-my-lg" />

    <div class="usage-section">
      <h4>How to Use</h4>
      <pre class="usage-code">{{ usageExample }}</pre>
    </div>
  </q-page>
</template>

<script>
import CodeBlock from '../components/CodeBlock.vue';

export default {
  name: 'CodeBlockExample',

  components: {
    CodeBlock
  },

  data() {
    return {
      pythonCode: `def fibonacci(n):
    """Calculate the nth Fibonacci number using recursion."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate and print first 10 Fibonacci numbers
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")`,

      javascriptCode: `// Async function to fetch user data
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}`,

      plainText: `This is plain text without syntax highlighting.
It will be displayed in a code block format
but won't have any color highlighting.

Useful for:
- Configuration files
- Plain text logs
- Unformatted output`,

      autoDetectCode: `function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}`,

      jsonCode: `{
  "name": "CodeBlock Component",
  "version": "1.0.0",
  "features": [
    "Syntax highlighting",
    "Copy to clipboard",
    "Language labels",
    "Auto-detect language"
  ],
  "dependencies": {
    "highlight.js": "^11.9.0"
  }
}`,

      usageExample: `// Basic usage
<CodeBlock
  :code="yourCodeString"
  language="python"
/>

// Without copy button
<CodeBlock
  :code="yourCodeString"
  language="javascript"
  :showCopyButton="false"
/>

// Auto-detect language
<CodeBlock
  :code="yourCodeString"
  :autoDetect="true"
/>

// With event handler
<CodeBlock
  :code="yourCodeString"
  language="typescript"
  @copied="handleCopied"
  @copy-error="handleCopyError"
/>

// Component setup
import CodeBlock from './components/CodeBlock.vue';

export default {
  components: { CodeBlock },
  methods: {
    handleCopied(code) {
      console.log('Code copied:', code);
    }
  }
}`
    };
  },

  methods: {
    onCopied(code) {
      this.$q.notify({
        message: 'Code copied to clipboard!',
        color: 'positive',
        position: 'top',
        timeout: 1500
      });
      console.log('Copied code:', code);
    }
  }
};
</script>

<style scoped>
.examples {
  max-width: 900px;
}

.examples h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #1976d2;
}

.usage-section {
  max-width: 900px;
}

.usage-code {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.4;
}

h3 {
  margin-top: 0;
  color: #1976d2;
}

/* Custom styles for example 5 */
:deep(.custom-pre) {
  background-color: #1e1e1e;
}

:deep(.custom-code) {
  color: #d4d4d4;
}
</style>
