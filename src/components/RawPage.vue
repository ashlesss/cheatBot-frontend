<template>
    <div>
        <q-input
            v-model="localMdContent"
            filled
            readonly
            autogrow
            type="textarea"
        />
    </div>
</template>
<script>

export default {
    props: ["content"],

    watch: {
        content(newContent) {
            this.localMdContent = newContent
        }
    },

    data() {
        return {
            localMdContent: this.content
        }
    },
}
</script>
<style>
    
</style>