"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { QrCodeGenerator } from "@/components/qr/QrCodeGenerator";
import { getCardRedirectUrl } from "@/lib/utils";

interface QrDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: {
    slug: string;
    name: string;
    business_name?: string;
  };
}

export function QrDownloadModal({ isOpen, onClose, card }: QrDownloadModalProps) {
  const qrUrl = getCardRedirectUrl(card.slug, "qr");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download QR Code"
      description={`Export high-resolution assets for ${card.name} (/r/${card.slug}?source=qr)`}
      maxWidth="md"
    >
      <div className="py-2">
        <QrCodeGenerator
          url={qrUrl}
          slug={card.slug}
          businessName={card.business_name}
          size={220}
          showControls={true}
        />
      </div>
    </Modal>
  );
}
