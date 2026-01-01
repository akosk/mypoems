<script setup lang="ts">
import type { FormError } from '#ui/types'

const props = defineProps<{
  paymentStatus: string;
  isBuying: boolean;
  purchaseOptions: {
    mode: 'digital' | 'print';
    price: number;
    details?: {
      copies: number;
      paperId: number;
      paperName: string;
    };
  } | null;
}>();

const emit = defineEmits<{
  (e: 'confirm-purchase', payload: { billingAddress: any; shippingAddress: any }): void;
  (e: 'back'): void;
}>();

const state = reactive({
  billing: {
    name: '',
    country: 'Magyarország',
    zip: '',
    city: '',
    address: ''
  },
  shippingSameAsBilling: true,
  shipping: {
    name: '',
    country: 'Magyarország',
    zip: '',
    city: '',
    address: ''
  }
});

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.billing.name) errors.push({ path: 'billing.name', message: 'Kötelező' })
  if (!state.billing.zip) errors.push({ path: 'billing.zip', message: 'Kötelező' })
  if (!state.billing.city) errors.push({ path: 'billing.city', message: 'Kötelező' })
  if (!state.billing.address) errors.push({ path: 'billing.address', message: 'Kötelező' })

  if (!state.shippingSameAsBilling) {
    if (!state.shipping.name) errors.push({ path: 'shipping.name', message: 'Kötelező' })
    if (!state.shipping.zip) errors.push({ path: 'shipping.zip', message: 'Kötelező' })
    if (!state.shipping.city) errors.push({ path: 'shipping.city', message: 'Kötelező' })
    if (!state.shipping.address) errors.push({ path: 'shipping.address', message: 'Kötelező' })
  }
  return errors
}

function handlePurchase() {
  const payload = {
    billingAddress: { ...state.billing },
    shippingAddress: state.shippingSameAsBilling ? { ...state.billing } : { ...state.shipping }
  };
  emit('confirm-purchase', payload);
}
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="text-lg font-bold">Rendelés összesítése</div>
      </template>
      <div v-if="purchaseOptions" class="space-y-2">
        <div class="flex justify-between">
          <span>Tétel:</span>
          <span class="font-medium">
            {{ purchaseOptions.mode === 'digital' ? 'Digitális Verseskötet (PDF)' : 'Nyomtatott Verseskötet + PDF' }}
          </span>
        </div>
        <div v-if="purchaseOptions.details" class="flex justify-between text-sm text-gray-500">
          <span>Részletek:</span>
          <span>{{ purchaseOptions.details.copies }} db, {{ purchaseOptions.details.paperName }}</span>
        </div>
        <div class="flex justify-between text-xl font-bold border-t pt-2 mt-2">
          <span>Végösszeg:</span>
          <span>{{ new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(purchaseOptions.price) }}</span>
        </div>
      </div>
    </UCard>

    <UForm :state="state" :validate="validate" class="space-y-6" @submit="handlePurchase">
      <UCard>
        <template #header>
          <div class="font-medium">Számlázási cím</div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Név" name="billing.name" class="w-full">
            <UInput v-model="state.billing.name" class="w-full" />
          </UFormField>
          
          <UFormField label="Ország" name="billing.country" class="w-full">
            <USelectMenu v-model="state.billing.country" :items="['Magyarország']" class="w-full" />
          </UFormField>

          <UFormField label="Irányítószám" name="billing.zip" class="w-full">
            <UInput v-model="state.billing.zip" class="w-full" />
          </UFormField>

          <UFormField label="Város" name="billing.city" class="w-full">
            <UInput v-model="state.billing.city" class="w-full" />
          </UFormField>

          <UFormField label="Cím (Utca, házszám)" name="billing.address" class="w-full md:col-span-2">
            <UInput v-model="state.billing.address" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-medium">Szállítási cím</div>
            <UCheckbox v-model="state.shippingSameAsBilling" label="Megegyezik a számlázási címmel" />
          </div>
        </template>
        
        <div v-if="!state.shippingSameAsBilling" class="grid grid-cols-1 md:grid-cols-2 gap-4">
           <UFormField label="Név" name="shipping.name" class="w-full">
            <UInput v-model="state.shipping.name" class="w-full" />
          </UFormField>
          
          <UFormField label="Ország" name="shipping.country" class="w-full">
             <USelectMenu v-model="state.shipping.country" :items="['Magyarország']" class="w-full" />
          </UFormField>

          <UFormField label="Irányítószám" name="shipping.zip" class="w-full">
            <UInput v-model="state.shipping.zip" class="w-full" />
          </UFormField>

          <UFormField label="Város" name="shipping.city" class="w-full">
            <UInput v-model="state.shipping.city" class="w-full" />
          </UFormField>

          <UFormField label="Cím (Utca, házszám)" name="shipping.address" class="w-full md:col-span-2">
            <UInput v-model="state.shipping.address" class="w-full" />
          </UFormField>
        </div>
        <div v-else class="text-sm text-gray-500 italic">
          A szállítási cím megegyezik a számlázási címmel.
        </div>
      </UCard>

      <div class="flex justify-between items-center pt-4">
        <UButton
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="$emit('back')"
        >
          Vissza
        </UButton>
        <UButton
          type="submit"
          size="xl"
          color="primary"
          variant="solid"
          icon="i-lucide-credit-card"
          :loading="isBuying"
        >
          Fizetés indítása
        </UButton>
      </div>
    </UForm>
  </div>
</template>
