<script setup lang="ts" generic="T extends 'update' | 'create'">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { User } from "@nduoseh/contract";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import z from "zod";
import UserImageUpload from "./UserImageUpload.vue";
import { ref } from "vue";
import { createUser, updateUser } from "../user.api";
import InputPassword from "@/components/input/InputPassword.vue";
import { ValidationException } from "@/api/exceptions/ValidationException";
import { WithMessageException } from "@/api/exceptions/WithMessageException";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { UserCircle2 } from "lucide-vue-next";

const props = defineProps<{
  type: T;
  data?: User;
}>();

const emit = defineEmits<{
  updated: [User];
}>();

const schema = z
  .object({
    name: z.string().min(2).max(255),
    email: z.string().email(),
    callname: z.string().max(20).nullable(),
    password: z
      .string()
      .max(20, { message: "Password must be less than 20 characters" })
      .superRefine((v, ctx) => {
        const val = v.length ? v : undefined;
        if (props.type == "update" && typeof val == "undefined") return;

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
    image: z.instanceof(File).nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.password && val.password !== val.password_confirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Password does not match",
        path: ["password_confirmation"],
      });
    }
  });

const { errors, ...form } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.data?.name,
    email: props.data?.email,
    callname: props.data?.callname,
  },
});

const loading = ref(false);
const onSubmit = form.handleSubmit(async (data) => {
  loading.value = true;
  try {
    if (props.type == "create") {
      const user = await createUser(data as any);
      toast.success("Success create user");
      emit("updated", user);
    } else {
      const user = await updateUser(props.data!.id, data);
      toast.success("Success update user");
      emit("updated", user);
    }
  } catch (err) {
    if (err instanceof ValidationException) {
      form.setErrors(err.issues);
      return;
    }

    if (err instanceof WithMessageException) {
      toast.error(err.message);
      return;
    }

    toast.error("Something went wrong");
    throw err;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <form @submit="onSubmit">
    <div
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-start"
    >
      <UserImageUpload
        :file="form.values.image"
        :user="data"
        :loading="loading"
        :error="errors.image"
        @update:file="form.setFieldValue('image', $event)"
      />
      <Card class="w-full col-span-2">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <UserCircle2 class="h-5 w-5" />
            User Data
          </CardTitle>
          <CardDescription> Change User information </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <FormField name="name" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" v-bind="componentField" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="email" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Email"
                  v-bind="componentField"
                  autocomplete="username"
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="callname" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Nick name</FormLabel>
              <FormControl>
                <Input placeholder="callname" v-bind="componentField" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="password" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputPassword v-bind="componentField" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="password_confirmation" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Re-Type Password</FormLabel>
              <FormControl>
                <InputPassword v-bind="componentField" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
        </CardContent>
      </Card>

      <div class="col-span-full flex justify-end">
        <Button :loading="loading"> Save </Button>
      </div>
    </div>
  </form>
</template>
