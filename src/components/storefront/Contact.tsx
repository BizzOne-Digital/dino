"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { SiteSettingsData } from "@/types";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["general", "order_inquiry", "product_request"]),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactProps {
  settings: SiteSettingsData;
}

export function Contact({ settings }: ContactProps) {
  const reducedMotion = useReducedMotion();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: "general" },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }
      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 lg:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-dino/5 to-caramel/5" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-forest sm:text-4xl">
              Get in Touch
            </h2>
            <p className="mt-4 text-charcoal/70 leading-relaxed">
              Questions about an order, custom requests, or just want to say hi? We&apos;d love to hear from you.
            </p>

            <div className="mt-8 space-y-4">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-charcoal/70 hover:text-forest transition-colors min-w-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dino/10">
                    <Mail size={18} className="text-dino" />
                  </div>
                  <span className="break-all text-sm sm:text-base">{settings.email}</span>
                </a>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 text-charcoal/70 hover:text-forest transition-colors min-w-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dino/10">
                    <Phone size={18} className="text-dino" />
                  </div>
                  <span className="text-sm sm:text-base">{settings.phone}</span>
                </a>
              )}
              {settings.pickup?.address && (
                <div className="flex items-start gap-3 text-charcoal/70 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dino/10">
                    <MapPin size={18} className="text-dino" />
                  </div>
                  <span className="break-words text-sm sm:text-base">{settings.pickup.address}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl"
            initial={reducedMotion ? {} : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Name</label>
                <input
                  {...register("name")}
                  className="w-full rounded-xl border border-beige px-4 py-3 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-caramel">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full rounded-xl border border-beige px-4 py-3 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20"
                  placeholder="you@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-caramel">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Phone (optional)</label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full rounded-xl border border-beige px-4 py-3 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20"
                  placeholder="(416) 555-0123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Type</label>
                <select
                  {...register("type")}
                  className="w-full rounded-xl border border-beige px-4 py-3 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20"
                >
                  <option value="general">General Inquiry</option>
                  <option value="order_inquiry">Order Inquiry</option>
                  <option value="product_request">Product Request</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-charcoal mb-1.5">Subject</label>
              <input
                {...register("subject")}
                className="w-full rounded-xl border border-beige px-4 py-3 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20"
                placeholder="What's this about?"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-caramel">{errors.subject.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-charcoal mb-1.5">Message</label>
              <textarea
                {...register("message")}
                rows={4}
                className="w-full rounded-xl border border-beige px-4 py-3 text-sm outline-none focus:border-dino focus:ring-2 focus:ring-dino/20 resize-none"
                placeholder="Tell us more..."
              />
              {errors.message && (
                <p className="mt-1 text-xs text-caramel">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest py-4 font-semibold text-cream hover:bg-dino disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
