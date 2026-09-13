export type SectionType =
  | "cover"
  | "text"
  | "table"
  | "investment"
  | "contact"
  | "thankyou"
  | "custom"
  | "bullets";

export interface Section {
  sectionId: string;
  type: SectionType;
  order: number;
  data: any;
}

export interface Proposal {
  _id?: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  status?: "draft" | "sent" | "approved" | "rejected";
  sections: Section[];
  totalAmount?: number;
  currency?: string;
  shareToken?: string;
  sentAt?: string | null;
  sentTo?: string | null;
  version?: number;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  cover: "Cover",
  text: "Text",
  table: "Table",
  investment: "Investment",
  contact: "Contact",
  thankyou: "Thank You",
  custom: "Custom",
  bullets: "Bullet Points",
};

export function defaultDataFor(type: SectionType): any {
  switch (type) {
    case "cover":
      return { heading: "", subheading: "" };
    case "text":
      return { heading: "", body: "" };
    case "table":
      return { heading: "",description: "", columns: [], rows: [] };
    case "investment":
      return { heading: "", items: [], paymentTerms: [] };
    case "contact":
      return { heading: "", rows: [] };
    case "thankyou":
      return { heading: "" };
    case "custom":
      return { heading: "", htmlSnippet: "" };
    case "bullets":
      return { mainHeading: "", heading: "", items: [""] };
    default:
      return {};
  }
}