<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from "lucide-vue-next";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    defaultValue?: string | number;
    modelValue?: string | number;
    placeholder?: string;
    autocomplete?: string;
  }>(),
  {
    placeholder: "••••••••",
    autocomplete: "current-password",
  },
);

const show = ref(false);
const icon = computed(() => (show.value ? EyeIcon : EyeOffIcon));
</script>

<template>
  <InputGroup>
    <InputGroupInput
      v-bind="$attrs"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :type="show ? 'text' : 'password'"
    />
    <InputGroupAddon align="inline-end" class="absolute right-0">
      <span @click="show = !show" class="cursor-pointer">
        <component :is="icon" class="size-4" />
      </span>
    </InputGroupAddon>
  </InputGroup>
</template>
