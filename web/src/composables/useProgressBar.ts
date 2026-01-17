import { ref } from "vue";

const isLoading = ref(false);
const progress = ref(0);
let interval: ReturnType<typeof setInterval> | null = null;

export function useProgressBar() {
  const start = () => {
    isLoading.value = true;
    progress.value = 0;

    if (interval) {
      clearInterval(interval);
    }

    // Simulate progress
    interval = setInterval(() => {
      if (progress.value < 90) {
        const increment = Math.random() * 10;
        progress.value = Math.min(progress.value + increment, 90);
      }
    }, 200);
  };

  const finish = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    progress.value = 100;

    setTimeout(() => {
      isLoading.value = false;
      progress.value = 0;
    }, 300);
  };

  const fail = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    progress.value = 100;
    isLoading.value = false;

    setTimeout(() => {
      progress.value = 0;
    }, 300);
  };

  return {
    isLoading,
    progress,
    start,
    finish,
    fail,
  };
}
