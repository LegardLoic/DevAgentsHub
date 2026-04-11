import type {
  CreateTemplatePayload,
  SavedTemplateDetail,
  SavedTemplateSummary,
  ToolRunInputMap,
  ToolSlug,
  UpdateTemplatePayload,
} from '@devagentshub/types';
import { excerpt } from '@devagentshub/utils';

import { apiFetch, patchJson, postJson } from './api';
import { buildSavedTemplateReuseHref } from './tool-runs';

export const listTemplates = () => apiFetch<SavedTemplateSummary[]>('/api/me/templates');

export const getTemplate = (id: string) => apiFetch<SavedTemplateDetail>(`/api/me/templates/${id}`);

export const createTemplate = (payload: CreateTemplatePayload) =>
  postJson<SavedTemplateDetail, CreateTemplatePayload>('/api/me/templates', payload);

export const duplicateTemplate = (id: string) =>
  apiFetch<SavedTemplateDetail>(`/api/me/templates/${id}/duplicate`, {
    method: 'POST',
  });

export const updateTemplate = (id: string, payload: UpdateTemplatePayload) =>
  patchJson<SavedTemplateDetail, UpdateTemplatePayload>(`/api/me/templates/${id}`, payload);

export const buildCreateTemplatePayload = <TSlug extends ToolSlug>(
  name: string,
  toolSlug: TSlug,
  input: ToolRunInputMap[TSlug],
): CreateTemplatePayload => {
  switch (toolSlug) {
    case 'prompt-generator':
      return {
        name,
        toolSlug: 'prompt-generator',
        input: input as ToolRunInputMap['prompt-generator'],
      };

    case 'project-structure-generator':
      return {
        name,
        toolSlug: 'project-structure-generator',
        input: input as ToolRunInputMap['project-structure-generator'],
      };

    case 'debug-helper':
      return {
        name,
        toolSlug: 'debug-helper',
        input: input as ToolRunInputMap['debug-helper'],
      };
  }
};

export const getSuggestedTemplateName = <TSlug extends ToolSlug>(
  toolSlug: TSlug,
  input: ToolRunInputMap[TSlug],
): string => {
  switch (toolSlug) {
    case 'prompt-generator': {
      const promptInput = input as ToolRunInputMap['prompt-generator'];
      return excerpt(`${promptInput.projectType} prompt`, 80);
    }

    case 'project-structure-generator': {
      const projectInput = input as ToolRunInputMap['project-structure-generator'];
      return excerpt(`${projectInput.projectName} structure`, 80);
    }

    case 'debug-helper': {
      const debugInput = input as ToolRunInputMap['debug-helper'];
      return excerpt(`Debug ${debugInput.errorMessage}`, 80);
    }
  }
};

export const getTemplatePrimaryCopyText = (template: SavedTemplateDetail): string =>
  JSON.stringify(template.input, null, 2);

export const getTemplateReuseHref = (template: SavedTemplateDetail): string =>
  buildSavedTemplateReuseHref(template);
