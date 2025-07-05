import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Message } from "ai";
import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

// Component to display attachments for a message
export function MessageAttachments({ message }: { message: Message }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
    
    const savedAttachments = useQuery(api.attachments.getAttachmentsByMessageId, {
      messageId: message.id,
    });
  
    // Combine experimental attachments (for new messages) and saved attachments
    const experimentalImageAttachments = message.experimental_attachments?.filter(
      (attachment) => attachment.contentType?.startsWith("image/")
    ) || [];
  
    const savedImageAttachments = savedAttachments?.filter(
      (attachment) => attachment.contentType?.startsWith("image/")
    ) || [];
  
    const allImageAttachments = [...experimentalImageAttachments, ...savedImageAttachments];
  
    if (allImageAttachments.length === 0) return null;

    const handleImageClick = (url: string) => {
      setSelectedImageUrl(url);
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedImageUrl("");
    };
  
    return (
      <>
        <div className="mt-2 space-y-2 justify-center flex flex-wrap">
          {allImageAttachments.map((attachment, index) => (
            <div key={`${message.id}-${index}`} className="max-w-xs">
              <Image
                src={attachment.url}
                alt={attachment.name || "Attachment"}
                width={300}
                height={200}
                className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(attachment.url)}
              />
            </div>
          ))}
        </div>

        {/* Modal for iframe */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl h-full max-h-[95vh] bg-zinc-900 rounded-lg overflow-hidden">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              {/* Image container instead of iframe */}
              <div className="w-full h-full p-4 flex items-center justify-center">
                <Image
                  src={selectedImageUrl} 
                  alt="Image preview"
                  width={1000}
                  height={1000}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
}

export const Iframe = ({url}: {url: string}) => {
  return (
    <div className="w-full h-full">
      <iframe 
        src={url} 
        title="description" 
        className="w-full h-full border-none"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overflow: "none"
        }}
        scrolling="no"
      />
    </div>
  );
};