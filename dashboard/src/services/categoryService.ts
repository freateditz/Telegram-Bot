import { api } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import type { Category, CategoryInput } from "@/types";

interface EnvelopeList<T> {
  ok?: boolean;
  items: T[];
}
interface EnvelopeItem<T> {
  ok?: boolean;
  item: T;
}

export const categoryService = {
  list: async (): Promise<Category[]> => {
    const { data } = await api.get<EnvelopeList<Category>>(
      API_ROUTES.categories.base
    );
    return data.items;
  },
  get: async (id: number | string): Promise<Category> => {
    const { data } = await api.get<EnvelopeItem<Category>>(
      API_ROUTES.categories.byId(id)
    );
    return data.item;
  },
  create: async (input: CategoryInput): Promise<Category> => {
    const { data } = await api.post<EnvelopeItem<Category>>(
      API_ROUTES.categories.base,
      input
    );
    return data.item;
  },
  update: async (
    id: number | string,
    input: Partial<CategoryInput>
  ): Promise<Category> => {
    const { data } = await api.patch<EnvelopeItem<Category>>(
      API_ROUTES.categories.byId(id),
      input
    );
    return data.item;
  },
  remove: async (id: number | string): Promise<void> => {
    await api.delete(API_ROUTES.categories.byId(id));
  },
};
