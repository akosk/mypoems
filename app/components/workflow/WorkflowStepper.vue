<script setup lang="ts">
defineProps<{
  steps: { label: string; value: string }[];
  currentStepIndex: number;
}>();
</script>

<template>
  <div class="flex justify-center items-center gap-4 py-6">
    <div
      v-for="(step, idx) in steps"
      :key="step.value"
      class="flex items-center"
    >
      <div
        class="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors"
        :class="[
          idx <= currentStepIndex
            ? 'border-primary-500 bg-primary-50 text-primary-600'
            : 'border-gray-200 text-gray-400'
        ]"
      >
        <UIcon
          v-if="idx < currentStepIndex"
          name="i-lucide-check"
          class="w-5 h-5"
        />
        <span v-else>{{ idx + 1 }}</span>
      </div>
      <span
        class="ml-2 text-sm font-medium transition-colors"
        :class="[idx <= currentStepIndex ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400']"
      >
        {{ step.label }}
      </span>
      <div
        v-if="idx < steps.length - 1"
        class="w-12 h-px ml-4 bg-gray-200 dark:bg-gray-700"
      />
    </div>
  </div>
</template>
