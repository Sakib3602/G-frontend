import { useParams } from "react-router";

export default function ProposalPublicView() {
  const { token } = useParams<{ token: string }>();

  const htmlUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/public/proposals/${token}`;
  const pdfUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/public/proposals/${token}/pdf`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f4f6f2" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "flex-end",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "10px 18px",
            background: "#16a34a",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Download PDF
        </a>
      </div>
      <iframe
        src={htmlUrl}
        title="Proposal"
        style={{ flex: 1, width: "100%", border: "none", minHeight: "calc(100vh - 56px)" }}
      />
    </div>
  );
}