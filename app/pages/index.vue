<script setup lang="ts">
</script>

<template>
  <div>
    <UPageHero
      title="Alkosson gyönyörű verseskötetet saját verseiből."
      description="Importáljon a poet.hu-ról, rendezze fejezetekbe, generáljon PDF-et és készítse el könyvét egyetlen folyamatban."
      orientation="horizontal"
      :links="[
        { label: 'Könyv készítése', to: '/workflow', size: 'lg', icon: 'i-lucide-book-plus' },
        { label: 'Hogyan működik?', to: '#how-it-works', size: 'lg', color: 'neutral', variant: 'outline' }
      ]"
    >

        <img
          src="/assets/images/hero.png"
          class="rounded-lg shadow-2xl ring ring-default"
          alt="Verseskötet illusztráció"
        />

    </UPageHero>

    <UContainer id="how-it-works" class="py-24">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Így készül el a könyve
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Négy egyszerű lépés a meglévő verseitől a nyomdakész kötetig.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <UCard class="relative overflow-hidden group hover:ring-2 hover:ring-primary-500/20 transition-all">
          <div class="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-primary-500">1</div>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-primary-600">
                <UIcon name="i-lucide-link" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-lg">Megadás</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Csak másolja be a Poet.hu szerzői oldalának linkjét. Rendszerünk automatikusan letölti az összes versét.
          </p>
        </UCard>

        <UCard class="relative overflow-hidden group hover:ring-2 hover:ring-primary-500/20 transition-all">
          <div class="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-primary-500">2</div>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-primary-600">
                <UIcon name="i-lucide-list-checks" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-lg">Válogatás</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Nézze át a listát, és egy kattintással vegye ki azokat a verseket, amelyeket nem szeretne a kötetben látni.
          </p>
        </UCard>

        <UCard class="relative overflow-hidden group hover:ring-2 hover:ring-primary-500/20 transition-all">
          <div class="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-primary-500">3</div>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-primary-600">
                <UIcon name="i-lucide-wand-2" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-lg">Rendezés</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            A mesterséges intelligencia tematikus fejezetekbe rendezi a verseit. Ön szabadon átnevezheti a fejezeteket.
          </p>
        </UCard>

        <UCard class="relative overflow-hidden group hover:ring-2 hover:ring-primary-500/20 transition-all">
          <div class="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-primary-500">4</div>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-primary-600">
                <UIcon name="i-lucide-book-down" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-lg">Letöltés</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Elkészül a formázott, tördelt, tartalomjegyzékkel ellátott könyv, amelyet azonnal letölthet PDF formátumban.
          </p>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
