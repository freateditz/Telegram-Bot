import { api } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import type { Project, ProjectInput } from "@/types";

interface EnvelopeList<T> {
  ok?: boolean;
  items: T[];
}
interface EnvelopeItem<T> {
  ok?: boolean;
  item: T;
}

export const projectService = {
  list: async (): Promise<Project[]> => {
    const { data } = await api.get<EnvelopeList<Project>>(
      API_ROUTES.projects.base
    );
    return data.items;
  },
  get: async (id: number | string): Promise<Project> => {
    const { data } = await api.get<EnvelopeItem<Project>>(
      API_ROUTES.projects.byId(id)
    );
    return data.item;
  },
  create: async (input: ProjectInput): Promise<Project> => {
    const { data } = await api.post<EnvelopeItem<Project>>(
      API_ROUTES.projects.base,
      input
    );
    return data.item;
  },
  update: async (
    id: number | string,
    input: Partial<ProjectInput>
  ): Promise<Project> => {
    const { data } = await api.put<EnvelopeItem<Project>>(
      API_ROUTES.projects.byId(id),
      input
    );
    return data.item;
  },
  remove: async (id: number | string): Promise<void> => {
    await api.delete(API_ROUTES.projects.byId(id));
  },
};
