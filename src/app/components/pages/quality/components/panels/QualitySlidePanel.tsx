import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export const QualitySlidePanel = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "w-[640px]",
}: Props) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-[998] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-[999] flex flex-col bg-neutral-50 shadow-2xl border-l border-neutral-200",
          "transition-transform duration-300 ease-out",
          width, "max-w-[95vw]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-neutral-200 bg-white shrink-0">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-0.5 h-7 bg-[#00775B] rounded-full shrink-0" />
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400 leading-none">{title}</h3>
              {subtitle && <p className="text-[15px] font-bold text-neutral-900 mt-0.5 leading-tight">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[4px] hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors border border-transparent hover:border-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
};
