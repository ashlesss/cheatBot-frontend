<template>
    <div v-html="renderMarkdown()" class="q-pa-md main"></div>
</template>
  

<script>
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import NotifyMixin from '../mixins/Notification'
import texmath from 'markdown-it-texmath'
import katex from 'katex'

export default {

  mixins: [NotifyMixin],

  data() {
    return {
      md: null,
      mdContent: ''
    };
  },

  computed: {
    mdFileID() {
      return this.$route.params.id
    },

    url() {
      return `${process.env.HOST}/${this.mdFileID}.md`
    },
  },

  created() {
    this.md = new MarkdownIt({
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return ''; // use external default escaping
      }
    }).use(texmath, {
      engine: katex,
      delimiters: [
      'dollars',
      'brackets',
      'doxygen',
      'gitlab',
      'julia',
      'kramdown',
      'beg_end'
      ],
      katexOptions: { macros: {"\\RR": "\\mathbb{R}"} }
    });

    // Custom renderer for code blocks
    const defaultRender = this.md.renderer.rules.fence || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

    this.md.renderer.rules.fence = function(tokens, idx, options, env, self) {
        const token = tokens[idx];
        const langName = token.info.trim();
        if (hljs.getLanguage(langName)) {
            return `<pre class="my-code-block"><div class="language-label">${langName}</div>${defaultRender(tokens, idx, options, env, self)}</pre>`;
        }
        else {
            return `<pre class="my-code-block">${defaultRender(tokens, idx, options, env, self)}</pre>`;
        }
      
    };
  },
  methods: {
    renderMarkdown() {
      return this.md.render(this.mdContent);
    }
  },

  mounted() {
    this.$axios.get(this.url)
        .then(res => {
            this.mdContent = res.data
            this.mdContent += `\n\n**Notes from developers:** `
            + `\n\nResponse can be view as raw format at: <${this.url}>.`
            + `\n\nIf you want to view the **formatted math expression**, use this site: [QuickLATEX](https://quicklatex.com/)`
            + ` and copy and paste contents from download link's file. Do **not** copy and paste the current web page content.`
            + ` Because current page is rendered in \`markdown\` so some of the math delimiters will be ignored or shown incorrectly.`
        })
        .catch(err => {
          if (err.response) {
              this.showErrNotif(err.response.data.error || `${err.response.status} ${err.response.statusText}`)
          }
          else {
              this.showErrNotif(err.message || err)
          }
        })
  }
};
</script>
<style>
.my-code-block {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
}

.language-label {
    background-color: #000000;
    color: #ffffff;
    font-weight: bold;
    font-size: 24px;
    border-radius: 10px;
}

.main {
  font-size: 20px;
}

.katex {
  background-color: #ffe208;
}
</style>
