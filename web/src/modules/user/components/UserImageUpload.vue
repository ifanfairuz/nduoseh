<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ErrorMessage from "@/components/ErrorMessage.vue";
import type { User } from "@nduoseh/contract";
import { Image } from "lucide-vue-next";

const props = defineProps<{
  file?: any | null;
  user?: User;
  error?: string | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:file": [File | null];
}>();

const errorInput = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);

const currentImageUrl = computed(() => {
  return props.user?.image;
});

const displayImageUrl = computed(() => {
  return previewUrl.value || currentImageUrl.value;
});

const error = computed(() => {
  return errorInput.value ?? props.error;
});

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    errorInput.value = "File must an Image";
    return;
  }

  if (file.size > 5_000_000) {
    errorInput.value = "Maximum file size is 5MB";
    return;
  }

  emit("update:file", file);
  previewUrl.value = URL.createObjectURL(file);
  errorInput.value = null;
};

const handleUploadClick = () => {
  fileInput.value?.click();
};

const handleCancel = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  emit("update:file", null);
  errorInput.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Image class="h-5 w-5" />
        Foto Profil
      </CardTitle>
      <CardDescription> Upload image (JPG or PNG, under 5MB) </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col justify-evenly h-full">
      <ErrorMessage :message="error" />
      <div class="flex flex-col items-center gap-4">
        <Avatar class="w-full h-auto aspect-square max-w-[200px]">
          <AvatarImage
            :src="displayImageUrl ?? ''"
            alt="user image"
            class="object-cover w-full h-full"
          />
          <AvatarFallback class="text-3xl"> IMG </AvatarFallback>
        </Avatar>

        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png"
          class="hidden"
          @change="handleFileSelect"
        />

        <div class="flex gap-2">
          <Button
            v-if="!file"
            type="button"
            variant="outline"
            @click="handleUploadClick"
          >
            Pick Image
          </Button>

          <template v-else>
            <Button
              type="button"
              variant="outline"
              @click="handleCancel"
              :disabled="loading"
            >
              Clear
            </Button>
          </template>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
