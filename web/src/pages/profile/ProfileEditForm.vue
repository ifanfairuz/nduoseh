<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toTypedSchema } from "@vee-validate/zod";
import z from "zod";
import { useForm } from "vee-validate";
import { useAuthStore } from "@/stores/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ValidationException } from "@/api/exceptions/ValidationException";
import { WithMessageException } from "@/api/exceptions/WithMessageException";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { toast } from "vue-sonner";

const store = useAuthStore();
const schema = toTypedSchema(
  z.object({
    email: z.string().email(),
    name: z.string().min(2).max(255),
    callname: z.string().min(2).max(20),
  })
);
const form = useForm({
  validationSchema: schema,
  initialValues: {
    email: store.userData?.email ?? "",
    name: store.userData?.name ?? "",
    callname: store.userData?.callname ?? "",
  },
});

const error = ref<string | null>(null);
const loading = ref(false);
const onSubmit = form.handleSubmit(async (values) => {
  try {
    error.value = null;
    loading.value = true;
    await store.update({
      email: values.email,
      name: values.name,
      callname: values.callname,
    });
    toast.success("Berhasil edit foto");
  } catch (err) {
    if (err instanceof ValidationException) {
      form.setErrors(err.issues);
      return;
    }

    if (err instanceof WithMessageException) {
      error.value = err.message;
    }

    throw err;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Edit Profil</CardTitle>
      <CardDescription> Ubah informasi profil Anda </CardDescription>
    </CardHeader>
    <CardContent>
      <ErrorMessage :message="error" />
      <form @submit="onSubmit">
        <FieldGroup>
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
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel for="name"> Nama </FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama"
                  required
                  autocomplete="name"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="callname">
            <FormItem>
              <FormLabel for="callname"> Nama Panggilan </FormLabel>
              <FormControl>
                <Input
                  id="callname"
                  type="text"
                  placeholder="Nama Panggilan"
                  required
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Field>
            <Button type="submit" :loading="loading"> simpan </Button>
          </Field>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
