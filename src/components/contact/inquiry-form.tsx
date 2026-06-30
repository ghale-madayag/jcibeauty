"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InquiryForm({
  services,
}: {
  services: { id: string; name: string }[];
}) {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    toast.success(
      "Thank you! Our concierge will contact you within 24 hours.",
    );
    form.reset();
  }

  return (
    <div className="rounded-2xl bg-accent p-8 sm:p-10">
      <h2 className="font-serif text-2xl font-bold">Send an Inquiry</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Complete the form below and our concierge will contact you within 24
        hours.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full Name">
          <Input name="name" placeholder="e.g. Maria Clara" required />
        </Field>
        <Field label="Email Address">
          <Input
            type="email"
            name="email"
            placeholder="maria@example.com"
            required
          />
        </Field>
        <Field label="Phone Number">
          <Input name="phone" placeholder="+63 912 345 6789" />
        </Field>
        <Field label="Service of Interest">
          <select
            name="service"
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="" disabled>
              Select a Treatment
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Your Message" className="sm:col-span-2">
          <Textarea
            name="message"
            placeholder="How can we help you achieve your skin goals?"
            className="min-h-32 bg-background"
            required
          />
        </Field>
        <Button
          type="submit"
          variant="gold"
          className="w-fit uppercase tracking-luxe sm:col-span-2"
        >
          Submit Inquiry
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-luxe text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
