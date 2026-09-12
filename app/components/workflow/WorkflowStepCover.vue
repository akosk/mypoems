<script setup lang="ts">
const props = defineProps<{
  chapters: Array<{ name: string, poems: any[] }>
  poetName?: string
  executionId: string | null
  initialBookTitle?: string
  initialAuthorName?: string
}>()

const emit = defineEmits<{
  (e: 'continue', data: { imageBase64: string, bookTitle: string, authorName: string }): void
}>()

type UIState = 'choose' | 'generating' | 'preview' | 'accepted'

const uiState = ref<UIState>('choose')
const imageBase64 = ref<string | null>(null)
const revisedPrompt = ref<string | null>(null)
const customPrompt = ref('')
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const bookTitle = ref(props.initialBookTitle || '')
const authorName = ref(props.initialAuthorName || '')

const previewSrc = computed(() => {
  if (!imageBase64.value) return null
  return `data:image/png;base64,${imageBase64.value}`
})

const poemTitles = computed(() => {
  return props.chapters.flatMap(ch => ch.poems?.map(p => p.title).filter(Boolean) || [])
})

const canProceed = computed(() => {
  return bookTitle.value.trim().length > 0 && authorName.value.trim().length > 0
})

async function handleUpload() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = null
  uiState.value = 'generating'

  const formData = new FormData()
  formData.append('cover', file)

  try {
    const res = await $fetch<{ ok: boolean, imageBase64: string }>('/api/upload-cover', {
      method: 'POST',
      body: formData
    })
    imageBase64.value = res.imageBase64
    uiState.value = 'preview'
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Nem sikerült feltölteni a képet.'
    uiState.value = 'choose'
  }
}

async function generateCover(prompt?: string) {
  error.value = null
  uiState.value = 'generating'

  try {
    const res = await $fetch<{ ok: boolean, imageBase64: string, revisedPrompt: string }>('/api/generate-cover', {
      method: 'POST',
      body: {
        prompt: prompt || undefined,
        poemTitles: poemTitles.value,
        poetName: props.poetName,
        bookTitle: bookTitle.value.trim() || undefined
      }
    })
    imageBase64.value = res.imageBase64
    revisedPrompt.value = res.revisedPrompt
    uiState.value = 'preview'
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Nem sikerült generálni a borítót.'
    uiState.value = 'choose'
  }
}

function acceptCover() {
  if (!imageBase64.value) return
  uiState.value = 'accepted'
}

function proceedFromAccepted() {
  if (!imageBase64.value) return
  emit('continue', {
    imageBase64: imageBase64.value,
    bookTitle: bookTitle.value.trim(),
    authorName: authorName.value.trim()
  })
}

function requestNew() {
  uiState.value = 'choose'
  imageBase64.value = null
  revisedPrompt.value = null
  customPrompt.value = ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      class="hidden"
      @change="onFileSelected"
    >

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :description="error"
      class="mb-4"
    />

    <!-- Choose state -->
    <UCard v-if="uiState === 'choose'" class="border-l-4 border-l-primary-500">
      <div class="flex items-start gap-4">
        <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
          <UIcon
            name="i-lucide-image"
            class="w-6 h-6 text-primary-600"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Borító kiválasztása</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Adja meg a könyv címét és a szerző nevét, majd válasszon borítóképet.
          </p>
        </div>
      </div>

      <div class="mt-6 space-y-4">
        <UFormField label="Könyv címe" required>
          <UInput
            v-model="bookTitle"
            placeholder="Pl. Válogatott versek"
            class="w-full"
            icon="i-lucide-book-open"
          />
        </UFormField>
        <UFormField label="Szerző neve" required>
          <UInput
            v-model="authorName"
            placeholder="Pl. Kiss Péter"
            class="w-full"
            icon="i-lucide-user"
          />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-upload"
            :disabled="!canProceed"
            @click="handleUpload"
          >
            Kép feltöltése
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-sparkles"
            :disabled="!canProceed"
            @click="generateCover()"
          >
            AI borító generálás
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Generating state -->
    <UCard v-if="uiState === 'generating'" class="border-l-4 border-l-primary-500">
      <div class="flex flex-col items-center gap-4 py-8">
        <UIcon
          name="i-lucide-loader-circle"
          class="w-10 h-10 text-primary-500 animate-spin"
        />
        <p class="text-gray-600 dark:text-gray-400">Borító generálása folyamatban...</p>
      </div>
    </UCard>

    <!-- Preview state -->
    <UCard v-if="uiState === 'preview' && imageBase64" class="border-l-4 border-l-primary-500">
      <div class="flex items-start gap-4 mb-4">
        <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
          <UIcon
            name="i-lucide-image"
            class="w-6 h-6 text-primary-600"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Borító előnézet</h3>
          <p
            v-if="revisedPrompt"
            class="text-xs text-gray-500 dark:text-gray-400 mt-1 italic"
          >
            {{ revisedPrompt }}
          </p>
        </div>
      </div>

      <div class="flex justify-center">
        <img
          :src="previewSrc!"
          alt="Borító előnézet"
          class="max-h-[500px] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
      </div>

      <template #footer>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              @click="requestNew"
            >
              Másik kép
            </UButton>
            <UButton
              color="primary"
              size="lg"
              icon="i-lucide-check"
              @click="acceptCover"
            >
              Elfogadom
            </UButton>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p class="text-sm text-gray-500 mb-2">Új AI kép egyedi leírással:</p>
            <div class="flex gap-2">
              <UInput
                v-model="customPrompt"
                placeholder="Pl. Őszi erdő, impresszionista stílusban..."
                class="flex-1"
              />
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-sparkles"
                :disabled="!customPrompt.trim()"
                @click="generateCover(customPrompt.trim())"
              >
                Generálás
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Accepted state: 3D Book Preview -->
    <div v-if="uiState === 'accepted' && imageBase64" class="space-y-8">
      <UCard class="border-l-4 border-l-primary-500">
        <div class="flex items-start gap-4 mb-6">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
            <UIcon
              name="i-lucide-book-open"
              class="w-6 h-6 text-primary-600"
            />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">A könyved előnézete</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Így fog kinézni a könyved borítója. Ha elégedett, folytassa a következő lépéssel.
            </p>
          </div>
        </div>

        <div class="flex justify-center py-8">
          <div class="book-scene">
            <div class="book">
              <!-- Front cover -->
              <div class="book-face book-front">
                <img
                  :src="previewSrc!"
                  alt="Borító"
                  class="book-cover-image"
                >
                <div class="book-overlay">
                  <div class="book-title">{{ bookTitle }}</div>
                  <div class="book-author">{{ authorName }}</div>
                </div>
              </div>
              <!-- Spine -->
              <div class="book-face book-spine">
                <span class="book-spine-title">{{ bookTitle }}</span>
              </div>
              <!-- Right side (pages) -->
              <div class="book-face book-right" />
              <!-- Top -->
              <div class="book-face book-top" />
              <!-- Bottom -->
              <div class="book-face book-bottom" />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              @click="uiState = 'preview'"
            >
              Vissza
            </UButton>
            <UButton
              color="primary"
              size="lg"
              icon="i-lucide-arrow-right"
              @click="proceedFromAccepted"
            >
              Tovább
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.book-scene {
  perspective: 800px;
  width: 280px;
  height: 380px;
}

.book {
  width: 280px;
  height: 380px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(-25deg) rotateX(5deg);
  transition: transform 0.4s ease;
}

.book:hover {
  transform: rotateY(-15deg) rotateX(3deg);
}

.book-face {
  position: absolute;
  backface-visibility: hidden;
}

.book-front {
  width: 280px;
  height: 380px;
  transform: translateZ(20px);
  border-radius: 0 4px 4px 0;
  overflow: hidden;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.3);
}

.book-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 1.5rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.1) 70%,
    rgba(0, 0, 0, 0.5) 100%
  );
}

.book-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  line-height: 1.3;
  text-align: center;
}

.book-author {
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  text-align: center;
}

.book-spine {
  width: 40px;
  height: 380px;
  transform: rotateY(-90deg) translateX(-20px);
  transform-origin: left center;
  background: linear-gradient(to right, #1a1a2e, #16213e);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
}

.book-spine-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 340px;
}

.book-right {
  width: 40px;
  height: 380px;
  transform: rotateY(90deg) translateX(20px);
  transform-origin: right center;
  background: linear-gradient(to right,
    #f5f0e8 0%, #e8e0d0 2%, #f5f0e8 4%,
    #e8e0d0 6%, #f5f0e8 8%, #e8e0d0 10%,
    #f5f0e8 12%, #e8e0d0 14%, #f5f0e8 16%,
    #e8e0d0 18%, #f5f0e8 20%, #e8e0d0 22%,
    #f5f0e8 24%, #e8e0d0 26%, #f5f0e8 28%,
    #f5f0e8 100%
  );
  right: 0;
}

.book-top {
  width: 280px;
  height: 40px;
  transform: rotateX(90deg) translateY(-20px);
  transform-origin: top center;
  background: linear-gradient(to bottom,
    #f5f0e8 0%, #e8e0d0 5%, #f5f0e8 10%,
    #f5f0e8 100%
  );
}

.book-bottom {
  width: 280px;
  height: 40px;
  transform: rotateX(-90deg) translateY(20px);
  transform-origin: bottom center;
  background: linear-gradient(to top,
    #f5f0e8 0%, #e8e0d0 5%, #f5f0e8 10%,
    #f5f0e8 100%
  );
  bottom: 0;
}
</style>
