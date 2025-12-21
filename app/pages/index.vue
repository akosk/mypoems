<script setup lang="ts">
</script>

<template>
  <div>

    <UPageHero
      title="Turn your poems into a beautifully printed book."
      description="Pay, import from poet.hu, review categories, generate a PDF, and send to print in one flow."
      orientation="horizontal"
      :links="[
        { label: 'Create my book', to: '/workflow', size: 'lg', icon: 'i-lucide-book-plus' },
        { label: 'How it works', to: '#how-it-works', size: 'lg', color: 'neutral', variant: 'outline' }
      ]"
    >

      <img
        src="/assets/images/hero.png"
        alt="Poetry book illustration"
         class="rounded-lg shadow-2xl ring ring-default"
      />


    </UPageHero>

    <UContainer id="how-it-works" class="py-24">
      <div class="grid gap-8 md:grid-cols-3">
        <UCard>
          <template #header>
            <div class="font-medium flex items-center gap-2">
              <UIcon name="i-lucide-import" class="w-5 h-5 text-primary"/>
              1) Import
            </div>
          </template>
          <p class="text-gray-600">Fetch poems from poet.hu and prepare a project.</p>
        </UCard>
        <UCard>
          <template #header>
            <div class="font-medium flex items-center gap-2">
              <UIcon name="i-lucide-check-square" class="w-5 h-5 text-primary"/>
              2) Review
            </div>
          </template>
          <p class="text-gray-600">Remove poems, adjust categories, reorder chapters.</p>
        </UCard>
        <UCard>
          <template #header>
            <div class="font-medium flex items-center gap-2">
              <UIcon name="i-lucide-printer" class="w-5 h-5 text-primary"/>
              3) Print
            </div>
          </template>
          <p class="text-gray-600">Generate PDF via PDFShift and send to the binder API.</p>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
