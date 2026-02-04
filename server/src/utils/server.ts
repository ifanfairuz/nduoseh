export function getServerName() {
  const base_url = process.env.BASE_URL;
  if (base_url) {
    const _url = new URL(base_url);
    return _url.host;
  }

  return 'kai-server';
}
