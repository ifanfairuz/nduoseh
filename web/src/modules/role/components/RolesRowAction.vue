<script setup lang="ts">
import type { Role } from "@panah/contract";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-vue-next";
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
import { ref } from "vue";
import { deleteRole, restoreRole } from "../role.api";
import { toast } from "vue-sonner";
import { WithMessageException } from "@/api/exceptions/WithMessageException";

const props = defineProps<{
  data: Role;
  editable?: boolean;
  deletable?: boolean;
}>();

const emit = defineEmits<{
  invalidateData: [];
}>();

const restore = async (data: Role) => {
  try {
    await restoreRole(data.id);
    toast.success(`Role "${data.name}" restored`);
    emit("invalidateData");
  } catch (error) {
    toast.error("Something went wrong while restoring role", {
      description:
        error instanceof WithMessageException ? error.message : String(error),
    });
  }
};

const loadingDelete = ref(false);
const deleteDialog = ref(false);
const confirmDelete = async () => {
  loadingDelete.value = true;
  try {
    const data = props.data;
    await deleteRole(data.id);
    deleteDialog.value = false;
    emit("invalidateData");
    toast.success(`Role "${data.name}" deleted`, {
      action: {
        label: "Undo",
        onClick: () => restore(data),
      },
    });
  } catch (error) {
    toast.error("Something went wrong while deleting role", {
      description:
        error instanceof WithMessageException ? error.message : String(error),
    });
  } finally {
    loadingDelete.value = false;
  }
};
</script>

<template>
  <ButtonGroup>
    <Button v-if="editable" size="icon-sm" as-child>
      <router-link :to="{ name: 'roles.edit', params: { id: data.id } }">
        <Pencil />
      </router-link>
    </Button>
    <AlertDialog
      v-if="deletable"
      v-model:open="deleteDialog"
      v-slot="{ close }"
    >
      <AlertDialogTrigger as-child>
        <Button size="icon-sm" variant="destructive">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete this role and remove it from all users.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="close">Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :loading="loadingDelete"
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </ButtonGroup>
</template>
