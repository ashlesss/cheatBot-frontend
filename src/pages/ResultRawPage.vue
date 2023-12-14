<template>
    <div class="q-pa-md">
    <q-input
      v-model="mdContent"
      filled
      autogrow
      type="textarea"
    />
  </div>

  <div class="q-pa-md" v-html="renderMarkdown()"></div>
    
</template>
<script>
import NotifyMixin from '../mixins/Notification'
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

export default {
    mixins: [NotifyMixin],

    data() {
        return {
            md: null,
            mdContent: '',
            devNotes: ''
        };
    },

    computed: {
        mdFileID() {
            return this.$route.params.id
        },

        url() {
            return `${process.env.HOST}/${this.mdFileID}.md`
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
            return this.md.render(this.devNotes);
        }
    },

    mounted() {
        this.$axios.get(this.url)
        .then(res => {
            this.mdContent = res.data
            this.devNotes = `**Notes from developers:** `
            + `\n\nResponse can be downloaded at: <${this.url}>.`
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
}
</script>
<style lang="">
    
</style>