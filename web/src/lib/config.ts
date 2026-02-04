export const config = {
  server_url: import.meta.env.VITE_SERVER_URL,
  get api_url() {
    return `${this.server_url}/api`;
  },
};
