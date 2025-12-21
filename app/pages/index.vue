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
      <div class="grid gap-8 md:grid-cols-3">
        <UCard>
          <template #header>
            <div class="font-medium flex items-center gap-2">
              <UIcon name="i-lucide-import" class="w-5 h-5 text-primary" />
              1) Importálás
            </div>
          </template>
          <p class="text-gray-600">Versek letöltése a poet.hu-ról a megadott azonosító alapján.</p>
        </UCard>
        <UCard>
          <template #header>
            <div class="font-medium flex items-center gap-2">
              <UIcon name="i-lucide-check-square" class="w-5 h-5 text-primary" />
              2) Ellenőrzés
            </div>
          </template>
          <p class="text-gray-600">Versek kiválogatása, fejezetek átnevezése és a sorrend finomítása.</p>
        </UCard>
        <UCard>
          <template #header>
            <div class="font-medium flex items-center gap-2">
              <UIcon name="i-lucide-printer" class="w-5 h-5 text-primary" />
              3) Nyomtatás
            </div>
          </template>
          <p class="text-gray-600">PDF generálása a PDFShift segítségével, nyomdakész formátumban.</p>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
