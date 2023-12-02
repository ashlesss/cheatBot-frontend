<template>
    <div v-html="renderMarkdown()"></div>
</template>
  

<script>
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import NotifyMixin from '../mixins/Notification'

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
    }
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
    this.$axios.get(`https://bot.ashless.io/${this.mdFileID}.md`)
        .then(res => {
            this.mdContent = res.data
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
</style>
