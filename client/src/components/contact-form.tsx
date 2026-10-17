"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiRequest } from "@/lib/api/client";

const contactSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

const contactResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ id: z.string() }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const submit = async (values: ContactFormValues) => {
    setSubmitError(null);
    try {
      const payload = await apiRequest<{ id: string }>("public/messages", {
        method: "POST",
        body: values,
      });
      if (!payload) throw new Error("The server returned no message receipt.");
      const result = contactResponseSchema.safeParse(payload);
      if (!result.success) {
        throw new Error("The server returned an unexpected response. Please try again.");
      }
      toast.success("Message sent. Thank you for reaching out.");
      reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Your message could not be sent. Please try again.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-row">
        <label className="form-field">
          <span>Name</span>
          <input
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            maxLength={120}
            placeholder="Your name"
            {...register("name")}
          />
          {errors.name && <span className="field-error">Please enter your name.</span>}
        </label>
        <label className="form-field">
          <span>Email</span>
          <input
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            maxLength={254}
            placeholder="you@example.com"
            type="email"
            {...register("email")}
          />
          {errors.email && <span className="field-error">Enter a valid email address.</span>}
        </label>
      </div>
      <label className="form-field">
        <span>Subject <span className="optional-label">Optional</span></span>
        <input maxLength={200} placeholder="What would you like to discuss?" {...register("subject")} />
        {errors.subject && <span className="field-error">Subject must be 200 characters or fewer.</span>}
      </label>
      <label className="form-field">
        <span>Message</span>
        <textarea
          aria-invalid={Boolean(errors.message)}
          maxLength={5000}
          placeholder="Write your message..."
          rows={5}
          {...register("message")}
        />
        {errors.message && <span className="field-error">Please enter a message.</span>}
      </label>
      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}
      <div className="contact-form__footer">
        <span className="form-hint">Your message goes directly to the portfolio inbox.</span>
        <button className="button button--primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              Sending <LoaderCircle aria-hidden="true" className="spin" size={16} />
            </>
          ) : (
            <>
              Send message <ArrowUpRight aria-hidden="true" size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
