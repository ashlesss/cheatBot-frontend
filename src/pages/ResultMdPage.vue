<template>
    <div>
        <q-markdown :src="mdContent"/>
    </div>
</template>
<script>
import NotifyMixin from '../mixins/Notification'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import MarkdownIt from 'markdown-it';

export default {

    mixins: [NotifyMixin],

    data() {
        return {
            mdContent: '',
            md: null
        }
    },

    created() {
        this.getMdContent()
    },

    methods: {
        getMdContent() {
            this.$axios.get(`https://bot.ashless.io/out-codeBlocks.md`)
            .then(res => {
                this.mdContent = res.data
            })
        },


    }
}
</script>
<style >
</style>