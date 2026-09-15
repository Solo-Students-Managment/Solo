import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const surveyFormStatusSchema = z.enum(["draft", "published"]);
export type SurveyFormStatus = z.infer<typeof surveyFormStatusSchema>;

export const surveyFormSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  description: z.string(),
  questionText: z.string().min(1),
  slug: z.string().min(1),
  status: surveyFormStatusSchema,
});
export type SurveyForm = z.infer<typeof surveyFormSchema>;
export const surveyFormsCollectionSchema = collectionSchema(surveyFormSchema);

export const formSubmissionSchema = z.object({
  id: opaqueIdSchema,
  formId: opaqueIdSchema,
  answerText: z.string().min(1),
  consentName: z.string().min(1),
  consentedAt: z.string().min(1),
  consentSnapshot: z.string().min(1),
});
export type FormSubmission = z.infer<typeof formSubmissionSchema>;

export type CreateSurveyFormInput = {
  title: string;
  description: string;
  questionText: string;
  slug: string;
};

export type SubmitPublicFormInput = {
  answerText: string;
  consentName: string;
  consentAccepted: boolean;
};

export type FormsClient = {
  list(organizationId: string): Promise<{
    data: SurveyForm[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateSurveyFormInput,
  ): Promise<SurveyForm>;
  publish(organizationId: string, formId: string): Promise<SurveyForm>;
  getPublic(slug: string): Promise<SurveyForm>;
  submitPublic(
    slug: string,
    input: SubmitPublicFormInput,
  ): Promise<FormSubmission>;
};

const formsMemory = new Map<string, SurveyForm[]>();
const submissionsBySlug = new Map<string, FormSubmission[]>();
const publicIndex = new Map<string, SurveyForm>();

function meta(data: SurveyForm[]) {
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

export function isValidPublicSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

export function buildConsentSnapshot(
  form: Pick<SurveyForm, "title" | "questionText">,
) {
  return `${form.title} — ${form.questionText}`;
}

export function createHttpFormsClient(): FormsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/forms`,
        {
          parse: (data) => surveyFormsCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/forms`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => surveyFormSchema.parse(data),
        },
      );
    },
    async publish(organizationId, formId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/forms/${encodeURIComponent(formId)}/publish`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => surveyFormSchema.parse(data),
        },
      );
    },
    async getPublic(slug) {
      return apiRequest(`/public/forms/${encodeURIComponent(slug)}`, {
        parse: (data) => surveyFormSchema.parse(data),
      });
    },
    async submitPublic(slug, input) {
      return apiRequest(
        `/public/forms/${encodeURIComponent(slug)}/submissions`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => formSubmissionSchema.parse(data),
        },
      );
    },
  };
}

export function createMockFormsClient(): FormsClient {
  return {
    async list(organizationId) {
      return meta(formsMemory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      if (!isValidPublicSlug(input.slug)) throw new Error("invalid slug");
      const row = surveyFormSchema.parse({
        id: opaqueIdSchema.parse(
          `frm_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        description: input.description.trim(),
        questionText: input.questionText.trim(),
        slug: input.slug.trim(),
        status: "draft",
      });
      formsMemory.set(organizationId, [
        ...(formsMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async publish(organizationId, formId) {
      const rows = formsMemory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(formId));
      if (idx < 0) throw new Error("not found");
      const updated = surveyFormSchema.parse({
        ...rows[idx]!,
        status: "published",
      });
      const next = [...rows];
      next[idx] = updated;
      formsMemory.set(organizationId, next);
      publicIndex.set(updated.slug, updated);
      return updated;
    },
    async getPublic(slug) {
      const form = publicIndex.get(slug);
      if (!form || form.status !== "published") throw new Error("not found");
      return form;
    },
    async submitPublic(slug, input) {
      const form = publicIndex.get(slug);
      if (!form || form.status !== "published") throw new Error("not found");
      if (!input.consentAccepted || !input.consentName.trim()) {
        throw new Error("consent required");
      }
      const row = formSubmissionSchema.parse({
        id: opaqueIdSchema.parse(
          `sub_${Math.random().toString(36).slice(2, 10)}`,
        ),
        formId: form.id,
        answerText: input.answerText.trim(),
        consentName: input.consentName.trim(),
        consentedAt: new Date().toISOString(),
        consentSnapshot: buildConsentSnapshot(form),
      });
      submissionsBySlug.set(slug, [
        ...(submissionsBySlug.get(slug) ?? []),
        row,
      ]);
      return row;
    },
  };
}

let client: FormsClient = createMockFormsClient();
export function getFormsClient() {
  return client;
}
export function setFormsClient(next: FormsClient) {
  client = next;
}
export function __resetMockForms() {
  formsMemory.clear();
  submissionsBySlug.clear();
  publicIndex.clear();
  client = createMockFormsClient();
}
