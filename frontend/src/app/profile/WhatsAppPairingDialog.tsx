"use client";

import { Dialog } from "@headlessui/react";
import { ExternalLink, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const WhatsAppPairingDialog = ({ open, whatsappUrl, onClose }: {
  open: boolean;
  whatsappUrl: string;
  onClose: () => void;
}) => (
  <Dialog open={open} onClose={onClose} className="relative z-[70]">
    <div className="fixed inset-0 bg-brand-dark/45 backdrop-blur-sm" aria-hidden="true" />
    <div className="fixed inset-0 overflow-y-auto px-4 py-6 sm:py-10">
      <div className="flex min-h-full items-center justify-center">
        <Dialog.Panel className="w-full max-w-md rounded-2xl border border-brand-dark/10 bg-white p-6 font-sans text-brand-dark shadow-[0_24px_80px_rgba(4,42,43,0.22)] sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                One last step
              </p>
              <Dialog.Title className="mt-2 text-2xl font-bold leading-tight tracking-[-0.015em]">
                Continue on WhatsApp
              </Dialog.Title>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-brand-dark/60 transition hover:bg-brand-dark/6 hover:text-brand-dark"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-brand-dark/72">
            Scan the code or open WhatsApp below. Send the prepared message within 10 minutes to connect your account.
          </p>

          <div className="mx-auto my-6 hidden w-fit rounded-2xl border border-brand-dark/10 bg-white p-4 sm:block">
            {whatsappUrl ? (
              <QRCodeSVG
                value={whatsappUrl}
                size={196}
                marginSize={1}
                title="Scan to connect WhatsApp"
              />
            ) : null}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary"
          >
            Open WhatsApp
            <ExternalLink className="h-4 w-4" />
          </a>
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
);

export default WhatsAppPairingDialog;
