import { z } from "zod";
import { apiRequest } from "@/services/api";

export const platformKpiSchema = z.object({
  organizations: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  mrrMinor: z.number().nonnegative(),
  openTickets: z.number().int().nonnegative(),
  currency: z.enum(["IRR", "USD"]),
  refreshedAt: z.string().min(1),
});
export type PlatformKpi = z.infer<typeof platformKpiSchema>;

export type AdminDashboardClient = {
  getKpis(): Promise<PlatformKpi>;
};

let cached: PlatformKpi | null = null;

export function createHttpAdminDashboardClient(): AdminDashboardClient {
  return {
    async getKpis() {
      return apiRequest("/admin/dashboard/kpis", {
        parse: (data) => platformKpiSchema.parse(data),
      });
    },
  };
}

export function createMockAdminDashboardClient(): AdminDashboardClient {
  return {
    async getKpis() {
      if (!cached) {
        cached = platformKpiSchema.parse({
          organizations: 128,
          activeUsers: 4120,
          mrrMinor: 85_000_000,
          openTickets: 17,
          currency: "IRR",
          refreshedAt: new Date().toISOString(),
        });
      }
      return cached;
    },
  };
}

let client: AdminDashboardClient = createMockAdminDashboardClient();
export function getAdminDashboardClient() {
  return client;
}
export function setAdminDashboardClient(next: AdminDashboardClient) {
  client = next;
}
