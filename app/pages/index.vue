<script setup lang="ts">
</script>

<template>
  <UContainer class="min-h-screen flex items-center">
    <div class="w-full py-16">
      <div class="mx-auto max-w-2xl text-center space-y-6">
        <p class="text-sm text-gray-500">mypoems</p>

        <h1 class="text-4xl font-semibold tracking-tight">
          Turn your poems into a beautifully printed book.
        </h1>

        <p class="text-lg text-gray-600">
          Pay, import from poet.hu, review categories, generate a PDF, and send to print in one flow.
        </p>

        <div class="flex items-center justify-center gap-3 pt-2">
          <UButton
            size="lg"
            to="/workflow"
          >
            Create my book
          </UButton>

          <UButton
            size="lg"
            color="gray"
            variant="soft"
            to="#how-it-works"
          >
            How it works
          </UButton>
        </div>

        <div id="how-it-works" class="mx-auto max-w-4xl mt-16">
          <div class="grid gap-4 md:grid-cols-3 text-left">
            <UCard>
              <template #header>
                <div class="font-medium">1) Import</div>
              </template>
              <p class="text-gray-600">Fetch poems from poet.hu and prepare a project.</p>
            </UCard>
            <UCard>
              <template #header>
                <div class="font-medium">2) Review</div>
              </template>
              <p class="text-gray-600">Remove poems, adjust categories, reorder chapters.</p>
            </UCard>
            <UCard>
              <template #header>
                <div class="font-medium">3) Print</div>
              </template>
              <p class="text-gray-600">Generate PDF via PDFShift and send to the binder API.</p>
            </UCard>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
