<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ValidationException } from "@/api/exceptions/ValidationException";
import { WithMessageException } from "@/api/exceptions/WithMessageException";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { toast } from "vue-sonner";

const store = useAuthStore();
const error = ref<string | null>(null);
const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const currentImageUrl = computed(() => {
  return store.userData?.image;
});

const displayImageUrl = computed(() => {
  return previewUrl.value || currentImageUrl.value;
});

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    error.value = "File must an Image";
    return;
  }

  if (file.size > 5_000_000) {
    error.value = "Maximum file size is 5MB";
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  error.value = null;
};

const handleUploadClick = () => {
  fileInput.value?.click();
};

const handleSubmit = async () => {
  if (!selectedFile.value) {
    error.value = "Select image first";
    return;
  }

  try {
    error.value = null;
    loading.value = true;
    await store.updateImage(selectedFile.value);

    // Clear preview and selected file after successful upload
    selectedFile.value = null;
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = null;
    }
    toast.success("Success edit image");
  } catch (err) {
    if (err instanceof ValidationException) {
      error.value = Object.values(err.issues).flat().join(", ");
      return;
    }

    if (err instanceof WithMessageException) {
      error.value = err.message;
      return;
    }

    error.value = "Gagal mengupload gambar";
    throw err;
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  selectedFile.value = null;
  error.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Foto Profil</CardTitle>
      <CardDescription>
        Upload foto profil Anda (JPG atau PNG, maksimal 5MB)
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col justify-evenly h-full">
      <ErrorMessage :message="error" />
      <div class="flex flex-col items-center gap-4">
        <Avatar class="w-full h-auto aspect-square max-w-[200px]">
          <AvatarImage
            :src="displayImageUrl ?? ''"
            :alt="store.userData?.name"
            class="object-cover w-full h-full"
          />
          <AvatarFallback class="text-3xl">
            {{ store.acronim }}
          </AvatarFallback>
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
            v-if="!selectedFile"
            type="button"
            variant="outline"
            @click="handleUploadClick"
          >
            Pilih Gambar
          </Button>

          <template v-else>
            <Button type="button" @click="handleSubmit" :loading="loading">
              Simpan
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="handleCancel"
              :disabled="loading"
            >
              Batal
            </Button>
          </template>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
