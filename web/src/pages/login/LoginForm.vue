<script setup lang="ts">
import { ref, type HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Brand from "@/components/Brand.vue";
import { toTypedSchema } from "@vee-validate/zod";
import z from "zod";
import { useForm } from "vee-validate";
import { useAuthStore } from "@/stores/auth.store";
import {
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ValidationException } from "@/api/exceptions/ValidationException";
import { WithMessageException } from "@/api/exceptions/WithMessageException";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
const schema = toTypedSchema(
  z.object({
    email: z.string().email({ message: "Email is invalid" }),
    password: z.string().min(1, { message: "Password is required" }),
  })
);
const form = useForm({
  validationSchema: schema,
});

const store = useAuthStore();
const loading = ref(false);
const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true;
    await store.loginWithPassword(values.email, values.password);
  } catch (error) {
    if (error instanceof ValidationException) {
      form.setErrors(error.issues);
      return;
    }

    if (error instanceof WithMessageException) {
      form.setErrors({ password: error.message });
    }

    throw error;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <form @submit="onSubmit">
      <FieldGroup>
        <div class="flex flex-col items-center gap-2 text-center">
          <Brand />
        </div>
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel for="email"> Email </FormLabel>
            <FormControl>
              <Input
                id="email"
                type="email"
                placeholder="me@example.com"
                required
                autocomplete="username"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel for="password"> Password </FormLabel>
            <FormControl>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Field>
          <Button type="submit" :loading="loading"> login </Button>
        </Field>
      </FieldGroup>
    </form>
    <FieldSeparator />
    <FieldDescription class="px-6 text-center">
      By logging in, you agree to our
      <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
