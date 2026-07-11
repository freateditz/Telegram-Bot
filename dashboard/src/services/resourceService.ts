import { api } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import type { Resource, ResourceInput, ResourceUpdateInput } from "@/types";

/**
 * The backend wraps list responses as `{ ok, items }` and single-item
 * responses as `{ ok, item }`. We unwrap here so hooks receive the
 * bare entity.
 */
interface EnvelopeList<T> {
  ok?: boolean;
  items: T[];
}
interface EnvelopeItem<T> {
  ok?: boolean;
  item: T;
}

export const resourceService = {
  list: async (): Promise<Resource[]> => {
    const { data } = await api.get<EnvelopeList<Resource>>(
      API_ROUTES.resources.base
    );
    return data.items;
  },
  get: async (id: number | string): Promise<Resource> => {
    const { data } = await api.get<EnvelopeItem<Resource>>(
      API_ROUTES.resources.byId(id)
    );
    return data.item;
  },
  create: async (input: ResourceInput): Promise<Resource> => {
    const { data } = await api.post<EnvelopeItem<Resource>>(
      API_ROUTES.resources.base,
      input
    );
    return data.item;
  },
  update: async (
    id: number | string,
    input: ResourceUpdateInput
  ): Promise<Resource> => {
    const { data } = await api.patch<EnvelopeItem<Resource>>(
      API_ROUTES.resources.byId(id),
      input
    );
    return data.item;
  },
  remove: async (id: number | string): Promise<void> => {
    await api.delete(API_ROUTES.resources.byId(id));
  },
};
