<script setup lang="ts">
const features = [
  'Создание персональных календарей',
  'Редактор макета и тем',
  'Экспорт в PDF, готовый к печати'
]
</script>

<template>
  <main class="app">
    <h1>12Frames — Calendar Studio & Workshop</h1>
    <p>Минимальный прототип фронтенда запущен ✅</p>

    <section>
      <h2>Фичи (MVP)</h2>
      <ul>
        <li v-for="f in features" :key="f">
          {{ f }}
        </li>
      </ul>
    </section>

    <section>
      <h2>API health</h2>
      <p>
        Для проверки backend зайдите на
        <code>/api/health</code>
        через nginx-прокси.
      </p>
    </section>
  </main>
</template>

<style scoped>
.app {
  max-width: 720px;
  margin: 2rem auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 0 1rem;
}
h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
h2 {
  margin-top: 1.5rem;
  font-size: 1.25rem;
}
ul {
  padding-left: 1.5rem;
}
code {
  background: #f3f3f3;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
