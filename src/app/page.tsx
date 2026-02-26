/**
 * Root page — middleware akan redirect ke /auth/login atau /todos
 * berdasarkan status session. Halaman ini tidak akan pernah dirender
 * secara langsung oleh user yang logged in atau logged out.
 */
export default function RootPage() {
  return null;
}
