import { SECTION_LABELS, type Section } from "@/types/proposal";
import {
  CoverEditor,
  TextEditor,
  TableEditor,
  InvestmentEditor,
  ContactEditor,
  ThankYouEditor,
  CustomEditor,
  BulletsEditor,
} from "./sections/SectionEditors";

type Props = {
  section: Section;
  onChange: (data: any) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

export default function SectionCard({ section, onChange, onMoveUp, onMoveDown, onDelete }: Props) {
  const renderEditor = () => {
    switch (section.type) {
      case "cover":
        return <CoverEditor data={section.data} onChange={onChange} />;
      case "text":
        return <TextEditor data={section.data} onChange={onChange} />;
      case "table":
        return <TableEditor data={section.data} onChange={onChange} />;
      case "investment":
        return <InvestmentEditor data={section.data} onChange={onChange} />;
      case "contact":
        return <ContactEditor data={section.data} onChange={onChange} />;
      case "thankyou":
        return <ThankYouEditor data={section.data} onChange={onChange} />;
      case "custom":
        return <CustomEditor data={section.data} onChange={onChange} />;
      case "bullets":
        return <BulletsEditor data={section.data} onChange={onChange} />;
      default:
        return <p className="text-red-500">Unknown section type: {section.type}</p>;
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-sm text-gray-600">{SECTION_LABELS[section.type]}</span>
        <div className="flex gap-2 text-sm">
          <button type="button" onClick={onMoveUp} className="px-2 py-1 border rounded">▲</button>
          <button type="button" onClick={onMoveDown} className="px-2 py-1 border rounded">▼</button>
          <button type="button" onClick={onDelete} className="px-2 py-1 border rounded text-red-500">Delete</button>
        </div>
      </div>
      {renderEditor()}
    </div>
  );
}