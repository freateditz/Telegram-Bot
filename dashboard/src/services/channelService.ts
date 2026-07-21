import { api } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import type { Channel, ChannelInput, ChannelUpdateInput } from "@/types";

interface EnvelopeList<T> {
  ok?: boolean;
  items: T[];
}
interface EnvelopeItem<T> {
  ok?: boolean;
  item: T;
}

export const channelService = {
  list: async (): Promise<Channel[]> => {
    const { data } = await api.get<EnvelopeList<Channel>>(API_ROUTES.channels.base);
    return data.items;
  },
  get: async (id: number | string): Promise<Channel> => {
    const { data } = await api.get<EnvelopeItem<Channel>>(API_ROUTES.channels.byId(id));
    return data.item;
  },
  create: async (input: ChannelInput): Promise<Channel> => {
    const { data } = await api.post<EnvelopeItem<Channel>>(API_ROUTES.channels.base, input);
    return data.item;
  },
  update: async (id: number | string, input: ChannelUpdateInput): Promise<Channel> => {
    const { data } = await api.put<EnvelopeItem<Channel>>(API_ROUTES.channels.byId(id), input);
    return data.item;
  },
  remove: async (id: number | string): Promise<void> => {
    await api.delete(API_ROUTES.channels.byId(id));
  },
};
