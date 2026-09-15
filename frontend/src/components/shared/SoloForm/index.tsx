"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  useFormContext,
  type DefaultValues,
  type FieldValues,
  type Path,
  type SubmitHandler,
} from "react-hook-form";
import type { ZodType } from "zod";

import { Button } from "@/components/ui";

type SoloFormProps<T extends FieldValues> = {
  schema: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  submitLabel?: string;
};

export function SoloForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitLabel = "Save",
}: SoloFormProps<T>) {
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
    mode: "onBlur",
  });

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}

export function SoloFieldError({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext();
  const message = errors[name as Path<FieldValues>]?.message;
  if (!message || typeof message !== "string") return null;
  return (
    <p role="alert" className="text-danger text-xs">
      {message}
    </p>
  );
}
