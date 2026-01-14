import { init } from '@paralleldrive/cuid2';

export function createCuid2Generator(fingerprint: string, length: number) {
  return init({
    fingerprint,
    length,
  });
}
