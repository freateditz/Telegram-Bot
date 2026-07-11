import { api } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import type { Platform, PlatformInput } from "@/types";

interface EnvelopeList<T> {
  ok?: boolean;
  items: T[];
}
interface EnvelopeItem<T> {
  ok?: boolean;
  item: T;
}

export const platformService = {
  list: async (): Promise<Platform[]> => {
    const { data } = await api.get<EnvelopeList<Platform>>(
      API_ROUTES.platforms.base
    );
    return data.items;
  },
  get: async (id: number | string): Promise<Platform> => {
    const { data } = await api.get<EnvelopeItem<Platform>>(
      API_ROUTES.platforms.byId(id)
    );
    return data.item;
  },
  create: async (input: PlatformInput): Promise<Platform> => {
    const { data } = await api.post<EnvelopeItem<Platform>>(
      API_ROUTES.platforms.base,
      input
    );
    return data.item;
  },
  update: async (
    id: number | string,
    input: Partial<PlatformInput>
  ): Promise<Platform> => {
    const { data } = await api.patch<EnvelopeItem<Platform>>(
      API_ROUTES.platforms.byId(id),
      input
    );
    return data.item;
  },
  remove: async (id: number | string): Promise<void> => {
    await api.delete(API_ROUTES.platforms.byId(id));
  },
};
