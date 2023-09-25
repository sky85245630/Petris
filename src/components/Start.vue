<script setup>
import { ref } from 'vue'
import {Application, Graphics} from "pixi.js"

defineProps({
  msg: String,
})

</script>

<template>
  <h1>{{ msg }}</h1>

</template>

<style scoped>
</style>
