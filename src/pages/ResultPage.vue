<template>
    <div v-html="renderedMarkdown"></div>
</template>
<script>
import MarkdownIt from 'markdown-it';

export default {
  data() {
    return {
      md: new MarkdownIt(),
      markdownContent: ""
    };
  },

  mounted() {
    this.requestMarkdownFile()
    // console.log(this.markdownContent)
  },

  methods: {
    requestMarkdownFile() {
        // this.$axios.get('https://raw.githubusercontent.com/ashlesss/querySys/main/update_log.md')
        // .then(res => {
        //     console.log(res)
        //     this.markdownContent = res.data
        // })
    }
  },

  computed: {
    renderedMarkdown() {
      return this.md.render(this.markdownContent);
    }
  }
};
</script>

<style lang="">
    
</style>