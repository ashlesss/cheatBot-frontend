export default {
    methods: {
      showSuccNotif (message) {
        this.$q.notify({
          message,
          color: 'positive',
          icon: 'done',
          timeout: 500
        })
      },
  
      showWarnNotif (message) {
        this.$q.notify({
          message,
          color: 'warning',
          icon: 'warning',
          timeout: 2000
        })
      },
  
      showErrNotif (message) {
        this.$q.notify({
          message,
          color: 'negative',
          icon: 'bug_report',
          timeout: 3000
        })
      }
    }
  }