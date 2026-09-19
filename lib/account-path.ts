export function safeAccountNext(value: string | null | undefined): string {
  return value && /^\/(?:connect|messages)\/[a-f0-9-]{36}$/i.test(value) ? value : '/account';
}
