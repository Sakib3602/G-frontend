import { SECTION_LABELS, type SectionType } from "@/types/proposal";
import { useState } from "react";


type Props = { onAdd: (type: SectionType) => void };

export default function AddSectionMenu({ onAdd }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
      >
        + Add Section
      </button>
      {open && (
        <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg w-56">
          {(Object.keys(SECTION_LABELS) as SectionType[]).map((type) => (
            <button
              key={type}
              type="button"
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
            >
              {SECTION_LABELS[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}