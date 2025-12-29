<script setup lang="ts">
const route = useRoute()
const workflowId = route.params.workflowId as string
const executionId = route.params.executionId as string
</script>

<template>
  <UPage>
    <UPageBody>
       <!-- You could display the workflowId if needed, e.g. in a breadcrumb or title -->
       <!-- <h1 class="text-xl font-bold text-center mb-4">Workflow: {{ workflowId }}</h1> -->
       
      <WorkflowManager :initial-execution-id="executionId" :key="executionId" />
    </UPageBody>
  </UPage>
</template>
