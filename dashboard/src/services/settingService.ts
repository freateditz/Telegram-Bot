import { api } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import type { Setting, SettingInput } from "@/types";

interface EnvelopeList<T> {
  ok?: boolean;
  items: T[];
}
interface EnvelopeItem<T> {
  ok?: boolean;
  item: T;
}

export const settingService = {
  list: async (): Promise<Setting[]> => {
    const { data } = await api.get<EnvelopeList<Setting>>(
      API_ROUTES.settings.base
    );
    return data.items;
  },
  get: async (id: number | string): Promise<Setting> => {
    const { data } = await api.get<EnvelopeItem<Setting>>(
      API_ROUTES.settings.byId(id)
    );
    return data.item;
  },
  create: async (input: SettingInput): Promise<Setting> => {
    const { data } = await api.post<EnvelopeItem<Setting>>(
      API_ROUTES.settings.base,
      input
    );
    return data.item;
  },
  update: async (
    id: number | string,
    input: Partial<SettingInput>
  ): Promise<Setting> => {
    const { data } = await api.patch<EnvelopeItem<Setting>>(
      API_ROUTES.settings.byId(id),
      input
    );
    return data.item;
  },
  remove: async (id: number | string): Promise<void> => {
    await api.delete(API_ROUTES.settings.byId(id));
  },
};
