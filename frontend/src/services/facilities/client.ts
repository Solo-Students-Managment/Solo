import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const facilityStatusSchema = z.enum([
  "available",
  "maintenance",
  "retired",
]);
export type FacilityStatus = z.infer<typeof facilityStatusSchema>;

export const roomSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  branchId: opaqueIdSchema,
  branchName: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  status: facilityStatusSchema,
});
export type Room = z.infer<typeof roomSchema>;
export const roomsCollectionSchema = collectionSchema(roomSchema);

export const equipmentSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  branchId: opaqueIdSchema,
  branchName: z.string().min(1),
  name: z.string().min(1),
  assetTag: z.string().min(1),
  status: facilityStatusSchema,
});
export type Equipment = z.infer<typeof equipmentSchema>;
export const equipmentCollectionSchema = collectionSchema(equipmentSchema);

export type CreateRoomInput = {
  branchId: string;
  name: string;
  capacity: number;
};

export type CreateEquipmentInput = {
  branchId: string;
  name: string;
  assetTag: string;
};

export type FacilitiesClient = {
  listRooms(organizationId: string): Promise<{
    data: Room[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createRoom(organizationId: string, input: CreateRoomInput): Promise<Room>;
  listEquipment(organizationId: string): Promise<{
    data: Equipment[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createEquipment(
    organizationId: string,
    input: CreateEquipmentInput,
  ): Promise<Equipment>;
};

const roomsMemory = new Map<string, Room[]>();
const equipmentMemory = new Map<string, Equipment[]>();

function meta<T>(data: T[]) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: Math.max(data.length, 1),
      totalItems: data.length,
      totalPages: 1,
    },
  };
}

export function isRoomBookable(status: FacilityStatus) {
  return status === "available";
}

export function createHttpFacilitiesClient(): FacilitiesClient {
  return {
    async listRooms(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/rooms`,
        { parse: (data) => roomsCollectionSchema.parse(data) },
      );
    },
    async createRoom(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/rooms`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => roomSchema.parse(data),
        },
      );
    },
    async listEquipment(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/equipment`,
        { parse: (data) => equipmentCollectionSchema.parse(data) },
      );
    },
    async createEquipment(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/equipment`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => equipmentSchema.parse(data),
        },
      );
    },
  };
}

export function createMockFacilitiesClient(): FacilitiesClient {
  return {
    async listRooms(organizationId) {
      return meta(roomsMemory.get(organizationId) ?? []);
    },
    async createRoom(organizationId, input) {
      const row = roomSchema.parse({
        id: opaqueIdSchema.parse(
          `room_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        branchId: opaqueIdSchema.parse(input.branchId),
        branchName: "Branch",
        name: input.name.trim(),
        capacity: input.capacity,
        status: "available",
      });
      roomsMemory.set(organizationId, [
        ...(roomsMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async listEquipment(organizationId) {
      return meta(equipmentMemory.get(organizationId) ?? []);
    },
    async createEquipment(organizationId, input) {
      const row = equipmentSchema.parse({
        id: opaqueIdSchema.parse(
          `eq_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        branchId: opaqueIdSchema.parse(input.branchId),
        branchName: "Branch",
        name: input.name.trim(),
        assetTag: input.assetTag.trim().toUpperCase(),
        status: "available",
      });
      equipmentMemory.set(organizationId, [
        ...(equipmentMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
  };
}

let client: FacilitiesClient = createMockFacilitiesClient();
export function getFacilitiesClient() {
  return client;
}
export function setFacilitiesClient(next: FacilitiesClient) {
  client = next;
}
export function __resetMockFacilities() {
  roomsMemory.clear();
  equipmentMemory.clear();
  client = createMockFacilitiesClient();
}
