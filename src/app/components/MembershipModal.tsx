"use client";

import { Dialog } from "@headlessui/react";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  disableEscape?: boolean; // 👈 new
}

const MembershipModal = ({ isOpen, onClose, disableEscape = false }: MembershipModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={disableEscape ? () => {} : onClose} // 👈 block backdrop/Escape if disableEscape
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg text-center space-y-4">
          <Dialog.Title className="text-xl font-bold">Become a Member</Dialog.Title>
          <p className="text-md text-brand-dark">
            You&apos;ve reached your free limit. Become a member to keep going.
          </p>
          <a
            href="/membership"
            className="inline-block text-brand-dark px-4 py-2 rounded-lg font-semibold hover:bg-brand-primary hover:text-white transition"
          >
            Join Membership &rarr;
          </a>
        </div>
      </div>
    </Dialog>
  );
};

export default MembershipModal;
