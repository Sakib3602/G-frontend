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
  proposalNumber?: string;
  sentAt?: string | null;
  sentTo?: string | null;
  version?: number;
  createdBy?: { _id: string; name?: string; email?: string } | string;
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
      return { heading: "", description: "", columns: [], rows: [] };
    case "investment":
      return { heading: "", items: [], paymentTerms: [] };
    case "contact":
      // Contact section select korlei ei fixed info auto-fill hoy, chaile edit kora jabe
      return {
        heading: "Contact Us",
        subheading: "We welcome all inquiries and are happy to arrange a call at a time that suits you.",
        rows: [
          {
            label: "Headquarters",
            value: "Room 6/A, Plot 32/C, Tropical Alauddin Tower, 6th Floor, Road 2, Sector 3, Uttara, Dhaka - 1230",
          },
          {
            label: "Sales Enquiries",
            value: "sales@genesysltd.com | 01329743367 | 01329743366",
          },
          {
            label: "Support",
            value: "support@genesysltd.com | Available 24/7 for active project clients",
          },
          {
            label: "Website",
            value: "www.genesysltd.com",
          },
        ],
      };
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