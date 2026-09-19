import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const shippingAddressSchema = z.object({
  id: opaqueIdSchema,
  label: z.string().min(1),
  line1: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  isDefault: z.boolean(),
});
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const returnRequestSchema = z.object({
  id: opaqueIdSchema,
  orderId: opaqueIdSchema,
  type: z.enum(["return", "exchange"]),
  reason: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.string(),
});
export type ReturnRequest = z.infer<typeof returnRequestSchema>;

export type ShippingReturnsClient = {
  listAddresses(): Promise<ShippingAddress[]>;
  createAddress(input: Omit<ShippingAddress, "id">): Promise<ShippingAddress>;
  updateAddress(
    id: string,
    input: Partial<Omit<ShippingAddress, "id">>,
  ): Promise<ShippingAddress>;
  deleteAddress(id: string): Promise<void>;
  requestReturn(orderId: string, reason: string): Promise<ReturnRequest>;
  requestExchange(orderId: string, reason: string): Promise<ReturnRequest>;
  listReturns(): Promise<ReturnRequest[]>;
};

export function createHttpShippingReturnsClient(): ShippingReturnsClient {
  return {
    async listAddresses() {
      return apiRequest("/personal/shipping-addresses", {
        parse: (d) => z.array(shippingAddressSchema).parse(d),
      });
    },
    async createAddress(input) {
      return apiRequest("/personal/shipping-addresses", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (d) => shippingAddressSchema.parse(d),
      });
    },
    async updateAddress(id, input) {
      return apiRequest(
        `/personal/shipping-addresses/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(input),
          parse: (d) => shippingAddressSchema.parse(d),
        },
      );
    },
    async deleteAddress(id) {
      await apiRequest(
        `/personal/shipping-addresses/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );
    },
    async requestReturn(orderId, reason) {
      return apiRequest("/personal/returns", {
        method: "POST",
        body: JSON.stringify({ orderId, type: "return", reason }),
        parse: (d) => returnRequestSchema.parse(d),
      });
    },
    async requestExchange(orderId, reason) {
      return apiRequest("/personal/returns", {
        method: "POST",
        body: JSON.stringify({ orderId, type: "exchange", reason }),
        parse: (d) => returnRequestSchema.parse(d),
      });
    },
    async listReturns() {
      return apiRequest("/personal/returns", {
        parse: (d) => z.array(returnRequestSchema).parse(d),
      });
    },
  };
}

export function createMockShippingReturnsClient(): ShippingReturnsClient {
  const addresses = new Map<string, ShippingAddress>();
  const returns: ReturnRequest[] = [];
  let seq = 1;
  const seed = shippingAddressSchema.parse({
    id: "addr_1",
    label: "Home",
    line1: "123 Main St",
    city: "Tehran",
    postalCode: "12345",
    country: "IR",
    isDefault: true,
  });
  addresses.set(String(seed.id), seed);

  return {
    async listAddresses() {
      return Array.from(addresses.values());
    },
    async createAddress(input) {
      const row = shippingAddressSchema.parse({
        ...input,
        id: `addr_${seq++}`,
      });
      addresses.set(String(row.id), row);
      return row;
    },
    async updateAddress(id, input) {
      const row = addresses.get(id);
      if (!row) throw new Error("not_found");
      const next = shippingAddressSchema.parse({ ...row, ...input });
      addresses.set(id, next);
      return next;
    },
    async deleteAddress(id) {
      addresses.delete(id);
    },
    async requestReturn(orderId, reason) {
      const row = returnRequestSchema.parse({
        id: `ret_${seq++}`,
        orderId,
        type: "return",
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      returns.push(row);
      return row;
    },
    async requestExchange(orderId, reason) {
      const row = returnRequestSchema.parse({
        id: `ret_${seq++}`,
        orderId,
        type: "exchange",
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      returns.push(row);
      return row;
    },
    async listReturns() {
      return [...returns];
    },
  };
}

let active: ShippingReturnsClient = createMockShippingReturnsClient();
export function setShippingReturnsClient(c: ShippingReturnsClient) {
  active = c;
}
export function getShippingReturnsClient() {
  return active;
}
