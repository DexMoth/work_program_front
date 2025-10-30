<script setup>
import Header from './globalComponents/Header.vue';
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/js/auth'

const authStore = useAuthStore()

onMounted(async () => {
    await authStore.checkAuth()
})
</script>

<template>
  <Header></Header>
  <div id="main">
    <RouterView />
  </div>
</template>

<style>
#main {
  padding: 0px 15%;
  padding-top: 30px;
  flex-grow: 1
}

:root {
    --color-main: rgb(23, 6, 95);
    --color-body: #e5e5e5;
    --color-nav: rgb(217, 202, 183);
    --color-link: rgb(46, 51, 210);
    --color-link-hover: rgb(58, 38, 191);
    --color-text: #0f0e0e;
}
</style>