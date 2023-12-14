
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/result/:id', component: () => import('pages/ResultPage.vue') },
      { path: '/resultmd/:id', component: () => import('pages/ResultMdPage.vue') },
      { path: '/resultRaw/:id', component: () => import('pages/ResultRawPage.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
