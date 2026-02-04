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
import InputPassword from "@/components/input/InputPassword.vue";

const store = useAuthStore();
const schema = toTypedSchema(
  z
    .object({
      email: z.string().email(),
      name: z.string().min(2).max(255),
      callname: z.string().min(2).max(20),
      password: z
        .string()
        .max(20, { message: "Password must be less than 20 characters" })
        .superRefine((v, ctx) => {
          const val = v.length ? v : undefined;
          if (typeof val == "undefined") return;

          const res = z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .refine((val) => /[A-Z]/.test(val), {
              message: "Password must contain at least one uppercase letter",
            })
            .refine((val) => /[a-z]/.test(val), {
              message: "Password must contain at least one lowercase letter",
            })
            .refine((val) => /[0-9]/.test(val), {
              message: "Password must contain at least one number",
            })
            .safeParse(val);

          if (!res.success) {
            res.error.issues.forEach((issue) => {
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: issue.path,
              });
            });
          }
        }),
      password_confirmation: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.password && val.password !== val.password_confirmation) {
        ctx.addIssue({
          code: "custom",
          message: "Password does not match",
          path: ["password_confirmation"],
        });
      }
    }),
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
      password: values.password,
    });
    toast.success("Success edit profile");
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
              <FormLabel for="name"> Name </FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  placeholder="Name"
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
              <FormLabel for="callname"> Nick Name </FormLabel>
              <FormControl>
                <Input
                  id="callname"
                  type="text"
                  placeholder="Nick Name"
                  required
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="password" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputPassword v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="password_confirmation" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Re-Type Password</FormLabel>
              <FormControl>
                <InputPassword v-bind="componentField" />
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
