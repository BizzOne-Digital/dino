import nodemailer from "nodemailer";
import type { IOrder } from "@/models/Order";
import { formatCurrency } from "@/lib/utils";

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });
}

function orderItemsHtml(order: IOrder): string {
  return order.items
    .map(
      (item) =>
        `<tr><td>${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}</td><td>${item.quantity}</td><td>${formatCurrency(item.lineTotal)}</td></tr>`
    )
    .join("");
}

export async function sendOrderConfirmationEmail(order: IOrder) {
  const transporter = getTransporter();
  if (!transporter) return;

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "sales@dinoscookiesandbagels.ca";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #173F2D;">Thank you for your order!</h1>
      <p>Hi ${order.customer.name},</p>
      <p>We've received your order <strong>#${order.orderNumber}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead><tr style="background: #FFF5E3;"><th align="left">Item</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>${orderItemsHtml(order)}</tbody>
      </table>
      <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
      <p>Fulfillment: ${order.fulfillment === "pickup" ? "Pickup" : "Local Delivery"}</p>
      <p>Payment: ${order.paymentMethod === "stripe" ? "Card (Stripe)" : "Pay on Pickup"}</p>
      <p style="color: #583629;">Dino's Cookies & Bagels</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Dino's Cookies & Bagels" <${process.env.SMTP_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmation #${order.orderNumber}`,
    html,
  });

  await transporter.sendMail({
    from: `"Dino's Cookies & Bagels" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `New Order #${order.orderNumber}`,
    html: `<p>New order from ${order.customer.name} (${order.customer.email})</p>${html}`,
  });
}

export async function sendOrderStatusEmail(order: IOrder, statusMessage: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"Dino's Cookies & Bagels" <${process.env.SMTP_USER}>`,
    to: order.customer.email,
    subject: `Order #${order.orderNumber} — ${statusMessage}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #173F2D;">Order Update</h2>
        <p>Hi ${order.customer.name},</p>
        <p>Your order <strong>#${order.orderNumber}</strong>: ${statusMessage}</p>
        <p style="color: #583629;">Dino's Cookies & Bagels</p>
      </div>
    `,
  });
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "sales@dinoscookiesandbagels.ca";

  await transporter.sendMail({
    from: `"Dino's Cookies & Bagels" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Contact: ${data.subject}`,
    html: `<p><strong>From:</strong> ${data.name} (${data.email})</p><p>${data.message}</p>`,
    replyTo: data.email,
  });
}
