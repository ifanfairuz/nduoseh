<script setup lang="ts">
import type { User } from "@panah/contract";
import { computed, ref } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";
import { getUserRoles, assignRole, removeRole } from "../user.api";
import { getRoles } from "@/modules/role/role.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, X, Shield } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { WithMessageException } from "@/api/exceptions/WithMessageException";
import PermissionScope from "@/components/PermissionScope.vue";
import Loader from "@/components/Loader.vue";
import { useAuthStore } from "@/stores/auth.store";

const props = defineProps<{
  userId: User["id"];
}>();

const auth = useAuthStore();

// Fetch user's current roles
const {
  data: userRoles,
  isPending: isLoadingRoles,
  refetch: refetchUserRoles,
} = useQuery({
  queryKey: ["users", props.userId, "roles"],
  queryFn: () => getUserRoles(props.userId),
});

// Fetch all available roles
const { data: allRolesData, isPending: isLoadingAllRoles } = useQuery({
  queryKey: ["roles"],
  queryFn: getRoles,
});

// Compute available roles to assign (exclude already assigned and inactive roles)
const availableRoles = computed(() => {
  if (!allRolesData.value || !userRoles.value) return [];

  const assignedRoleIds = new Set(userRoles.value.map((r) => r.id));

  return allRolesData.value.data.filter(
    (role) => !assignedRoleIds.has(role.id) && role.active && !role.deleted_at,
  );
});

// Assign role mutation
const assignRoleMutation = useMutation({
  mutationFn: (roleId: string) => assignRole(props.userId, roleId),
  onSuccess: async () => {
    await refetchUserRoles();
    toast.success("Role assigned successfully");
    addRoleDialog.value = false;
    selectedRoleToAdd.value = null;
  },
  onError: (error) => {
    toast.error("Failed to assign role", {
      description:
        error instanceof WithMessageException ? error.message : String(error),
    });
  },
});

// Remove role mutation
const removeRoleMutation = useMutation({
  mutationFn: (roleId: string) => removeRole(props.userId, roleId),
  onSuccess: async () => {
    await refetchUserRoles();
    toast.success("Role removed successfully");
  },
  onError: (error) => {
    toast.error("Failed to remove role", {
      description:
        error instanceof WithMessageException ? error.message : String(error),
    });
  },
});

const addRoleDialog = ref(false);
const selectedRoleToAdd = ref<string | null>(null);

const handleAssignRole = () => {
  if (selectedRoleToAdd.value) {
    assignRoleMutation.mutate(selectedRoleToAdd.value);
  }
};

const handleRemoveRole = (roleId: string) => {
  removeRoleMutation.mutate(roleId);
};
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2">
            <Shield class="h-5 w-5" />
            Assigned Roles
          </CardTitle>
          <CardDescription> Manage user roles and permissions </CardDescription>
        </div>
        <PermissionScope if="users.roles.assign">
          <AlertDialog v-model:open="addRoleDialog">
            <AlertDialogTrigger as-child>
              <Button size="sm" :disabled="availableRoles.length === 0">
                <Plus class="h-4 w-4" />
                Add Role
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Assign Role</AlertDialogTitle>
                <AlertDialogDescription>
                  Select a role to assign to this user. Only active roles are
                  shown.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div class="max-h-[300px] overflow-y-auto space-y-2">
                <div
                  v-if="isLoadingAllRoles"
                  class="flex items-center justify-center py-8"
                >
                  <Loader />
                </div>
                <div
                  v-else-if="availableRoles.length === 0"
                  class="text-center py-8 text-muted-foreground"
                >
                  No roles available to assign
                </div>
                <label
                  v-else
                  v-for="role in availableRoles"
                  :key="role.id"
                  :for="`role-${role.id}`"
                  class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  :class="{
                    'bg-accent border-primary': selectedRoleToAdd === role.id,
                  }"
                >
                  <input
                    :id="`role-${role.id}`"
                    type="radio"
                    :value="role.id"
                    v-model="selectedRoleToAdd"
                    class="mt-1"
                  />
                  <div class="flex-1 space-y-1">
                    <div class="font-medium">
                      {{ role.name }}
                    </div>
                    <div
                      v-if="role.description"
                      class="text-sm text-muted-foreground"
                    >
                      {{ role.description }}
                    </div>
                    <div class="flex items-center gap-1 flex-wrap">
                      <Badge
                        v-if="role.is_system"
                        variant="outline"
                        class="text-xs"
                      >
                        System
                      </Badge>
                      <span class="text-xs text-muted-foreground">
                        {{ role.permissions.length }} permission(s)
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  @click="handleAssignRole"
                  :loading="assignRoleMutation.isPending.value"
                  :disabled="!selectedRoleToAdd"
                >
                  Assign Role
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PermissionScope>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="isLoadingRoles" class="flex items-center justify-center py-8">
        <Loader />
      </div>
      <div
        v-else-if="!userRoles || userRoles.length === 0"
        class="text-center py-8 text-muted-foreground"
      >
        No roles assigned yet
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <Badge
          v-for="role in userRoles"
          :key="role.id"
          variant="secondary"
          class="px-3 py-1.5 text-sm flex items-center gap-2"
        >
          <Shield class="h-3 w-3" />
          <span>{{ role.name }}</span>
          <PermissionScope if="users.roles.remove">
            <button
              v-if="
                (auth.isSuperAdmin && auth.userData?.id != userId) ||
                !role.is_system
              "
              @click="handleRemoveRole(role.id)"
              :disabled="removeRoleMutation.isPending.value"
              class="hover:text-destructive transition-colors"
              type="button"
            >
              <X class="h-3 w-3" />
            </button>
          </PermissionScope>
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>
