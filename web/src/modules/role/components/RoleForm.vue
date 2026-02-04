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
import { Textarea } from "@/components/ui/textarea";
import type { Role, PermissionGroup } from "@nduoseh/contract";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import z from "zod";
import { ref, onMounted } from "vue";
import { createRole, updateRole, getAvailablePermissions } from "../role.api";
import { ValidationException } from "@/api/exceptions/ValidationException";
import { WithMessageException } from "@/api/exceptions/WithMessageException";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Loader from "@/components/Loader.vue";

const props = defineProps<{
  type: T;
  data?: Role;
}>();

const emit = defineEmits<{
  updated: [Role];
}>();

const schema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission required"),
  active: z.boolean().optional(),
});

const { errors, ...form } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.data?.name,
    slug: props.data?.slug,
    description: props.data?.description || "",
    permissions: props.data?.permissions || [],
    active: props.data?.active,
  },
});

// Fetch available permissions
const permissionGroups = ref<PermissionGroup[]>([]);
const loadingPermissions = ref(true);

onMounted(async () => {
  try {
    const response = await getAvailablePermissions();
    permissionGroups.value = response.groups;
  } catch (error) {
    toast.error("Failed to load available permissions");
  } finally {
    loadingPermissions.value = false;
  }
});

// Check if a permission is selected
const isPermissionSelected = (permission: string, values: string[]) => {
  return values?.includes(permission) ?? false;
};

// Toggle permission selection
const togglePermission = (permission: string, checked: boolean) => {
  const current = form.values.permissions || [];
  if (checked) {
    if (!current.includes(permission)) {
      form.setFieldValue("permissions", [...current, permission]);
    }
  } else {
    form.setFieldValue(
      "permissions",
      current.filter((p) => p !== permission),
    );
  }
};

// Toggle all permissions in a group
const toggleGroupPermissions = (group: PermissionGroup, checked: boolean) => {
  const current = form.values.permissions || [];
  if (checked) {
    const newPermissions = [...current];
    group.permissions.forEach((perm) => {
      if (!newPermissions.includes(perm)) {
        newPermissions.push(perm);
      }
    });
    form.setFieldValue("permissions", newPermissions);
  } else {
    form.setFieldValue(
      "permissions",
      current.filter((p) => !group.permissions.includes(p)),
    );
  }
};

// Check if all permissions in a group are selected
const isGroupFullySelected = (group: PermissionGroup, values: string[]) => {
  const current = values || [];
  return group.permissions.every((perm) => current.includes(perm));
};

// Check if some permissions in a group are selected
const isGroupPartiallySelected = (group: PermissionGroup, values: string[]) => {
  const current = values || [];
  const selectedCount = group.permissions.filter((perm) =>
    current.includes(perm),
  ).length;
  return selectedCount > 0 && selectedCount < group.permissions.length;
};

// Format resource name for display
const formatResourceName = (resource: string) => {
  return resource.charAt(0).toUpperCase() + resource.slice(1);
};

const loading = ref(false);
const onSubmit = form.handleSubmit(async (data) => {
  loading.value = true;
  try {
    if (props.type == "create") {
      const role = await createRole(data as any);
      toast.success("Success create role");
      emit("updated", role);
    } else {
      const { slug, ...updateData } = data;
      const role = await updateRole(props.data!.id, updateData);
      toast.success("Success update role");
      emit("updated", role);
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
  <form @submit="onSubmit" class="p-4">
    <div class="grid grid-cols-1 gap-6">
      <Card class="w-full">
        <CardHeader>
          <CardTitle>Role Data</CardTitle>
          <CardDescription> Change role information </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <FormField name="name" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Role name" v-bind="componentField" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="slug" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="role-slug"
                  v-bind="componentField"
                  :disabled="type === 'update'"
                />
              </FormControl>
              <FormDescription>
                {{
                  type === "update"
                    ? "Slug cannot be changed"
                    : "Lowercase, use hyphens for spaces"
                }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="description" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Role description"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="active">
            <FormItem v-if="type === 'update'">
              <FormLabel>Status</FormLabel>
              <Select
                :model-value="String(form.values.active)"
                @update:model-value="
                  (val) => form.setFieldValue('active', val === 'true')
                "
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Inactive roles cannot be assigned to users
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </CardContent>
      </Card>

      <Card class="w-full">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription> Select permissions for this role </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField name="permissions" v-slot="{ value }">
            <FormItem>
              <div v-if="loadingPermissions" class="py-8 flex justify-center">
                <Loader />
              </div>
              <div v-else class="space-y-6">
                <div
                  v-for="group in permissionGroups"
                  :key="group.resource"
                  class="space-y-3"
                >
                  <div class="flex items-center space-x-2 border-b pb-2">
                    <Checkbox
                      :id="`group-${group.resource}`"
                      :model-value="isGroupFullySelected(group, value)"
                      :indeterminate="isGroupPartiallySelected(group, value)"
                      @update:model-value="
                        toggleGroupPermissions(group, $event == true)
                      "
                    />
                    <label
                      :for="`group-${group.resource}`"
                      class="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {{ formatResourceName(group.resource) }}
                    </label>
                  </div>
                  <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-6"
                  >
                    <div
                      v-for="permission in group.permissions"
                      :key="permission"
                      class="flex items-center space-x-2"
                    >
                      <Checkbox
                        :id="permission"
                        :model-value="isPermissionSelected(permission, value)"
                        @update:model-value="
                          togglePermission(permission, $event == true)
                        "
                      />
                      <label
                        :for="permission"
                        class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {{ permission }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>
        </CardContent>
      </Card>

      <div class="flex justify-end">
        <Button :loading="loading" :disabled="data?.is_system">
          {{ data?.is_system ? "System role cannot be edited" : "Save" }}
        </Button>
      </div>
    </div>
  </form>
</template>
