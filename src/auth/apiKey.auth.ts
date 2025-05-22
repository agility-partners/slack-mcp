export const apiKeyGuard = {
  /**
   * Elysia beforeHandle guard that checks for a Bearer token in the Authorization header.
   * If the token does not match the configured API_KEY, responds with 401 Unauthorized.
   */
  async beforeHandle({ request, set }: { request: Request; set: any }) {
    const API_KEY = process.env.API_KEY || "123";
    // Expect header: Authorization: Bearer <token>
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
    if (token !== API_KEY) {
      set.status = 401;
      return "Unauthorized: Invalid Bearer token";
    }
  }
};