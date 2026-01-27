<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from "lucide-vue-next";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Button } from "../ui/button";
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
      <Button
        variant="ghost"
        type="button"
        class="bg-transparent!"
        @click="show = !show"
      >
        <component :is="icon" />
      </Button>
    </InputGroupAddon>
  </InputGroup>
</template>
