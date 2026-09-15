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

export const submissionReviewStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export type SubmissionReviewStatus = z.infer<
  typeof submissionReviewStatusSchema
>;

export const formSubmissionSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  formId: opaqueIdSchema,
  formTitle: z.string().min(1),
  answerText: z.string().min(1),
  consentName: z.string().min(1),
  consentedAt: z.string().min(1),
  consentSnapshot: z.string().min(1),
  reviewStatus: submissionReviewStatusSchema,
  internalComment: z.string(),
});
export type FormSubmission = z.infer<typeof formSubmissionSchema>;
export const formSubmissionsCollectionSchema =
  collectionSchema(formSubmissionSchema);

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
  listSubmissions(organizationId: string): Promise<{
    data: FormSubmission[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  commentSubmission(
    organizationId: string,
    submissionId: string,
    comment: string,
  ): Promise<FormSubmission>;
  decideSubmission(
    organizationId: string,
    submissionId: string,
    decision: "approved" | "rejected",
  ): Promise<FormSubmission>;
};

const formsMemory = new Map<string, SurveyForm[]>();
const submissionsByOrg = new Map<string, FormSubmission[]>();
const publicIndex = new Map<string, SurveyForm>();

function formMeta(data: SurveyForm[]) {
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

function submissionMeta(data: FormSubmission[]) {
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

export function canDecideSubmission(status: SubmissionReviewStatus) {
  return status === "pending";
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
    async listSubmissions(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/form-submissions`,
        {
          parse: (data) => formSubmissionsCollectionSchema.parse(data),
        },
      );
    },
    async commentSubmission(organizationId, submissionId, comment) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/form-submissions/${encodeURIComponent(submissionId)}/comment`,
        {
          method: "POST",
          body: JSON.stringify({ comment }),
          parse: (data) => formSubmissionSchema.parse(data),
        },
      );
    },
    async decideSubmission(organizationId, submissionId, decision) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/form-submissions/${encodeURIComponent(submissionId)}/decide`,
        {
          method: "POST",
          body: JSON.stringify({ decision }),
          parse: (data) => formSubmissionSchema.parse(data),
        },
      );
    },
  };
}

export function createMockFormsClient(): FormsClient {
  return {
    async list(organizationId) {
      return formMeta(formsMemory.get(organizationId) ?? []);
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
        organizationId: form.organizationId,
        formId: form.id,
        formTitle: form.title,
        answerText: input.answerText.trim(),
        consentName: input.consentName.trim(),
        consentedAt: new Date().toISOString(),
        consentSnapshot: buildConsentSnapshot(form),
        reviewStatus: "pending",
        internalComment: "",
      });
      const orgId = String(form.organizationId);
      submissionsByOrg.set(orgId, [
        ...(submissionsByOrg.get(orgId) ?? []),
        row,
      ]);
      return row;
    },
    async listSubmissions(organizationId) {
      return submissionMeta(submissionsByOrg.get(organizationId) ?? []);
    },
    async commentSubmission(organizationId, submissionId, comment) {
      const rows = submissionsByOrg.get(organizationId) ?? [];
      const idx = rows.findIndex(
        (row) => String(row.id) === String(submissionId),
      );
      if (idx < 0) throw new Error("not found");
      const updated = formSubmissionSchema.parse({
        ...rows[idx]!,
        internalComment: comment.trim(),
      });
      const next = [...rows];
      next[idx] = updated;
      submissionsByOrg.set(organizationId, next);
      return updated;
    },
    async decideSubmission(organizationId, submissionId, decision) {
      const rows = submissionsByOrg.get(organizationId) ?? [];
      const idx = rows.findIndex(
        (row) => String(row.id) === String(submissionId),
      );
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (!canDecideSubmission(current.reviewStatus)) {
        throw new Error("already decided");
      }
      const updated = formSubmissionSchema.parse({
        ...current,
        reviewStatus: decision,
      });
      const next = [...rows];
      next[idx] = updated;
      submissionsByOrg.set(organizationId, next);
      return updated;
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
  submissionsByOrg.clear();
  publicIndex.clear();
  client = createMockFormsClient();
}
