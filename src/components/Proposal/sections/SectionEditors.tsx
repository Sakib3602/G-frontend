type EditorProps = { data: any; onChange: (data: any) => void };

export function CoverEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded p-2"
        placeholder="Heading (e.g. PROPOSAL)"
        value={data.heading || ""}
        onChange={(e) => onChange({ ...data, heading: e.target.value })}
      />
      <input
        className="w-full border rounded p-2"
        placeholder="Subheading"
        value={data.subheading || ""}
        onChange={(e) => onChange({ ...data, subheading: e.target.value })}
      />
    </div>
  );
}

export function TextEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded p-2"
        placeholder="Heading"
        value={data.heading || ""}
        onChange={(e) => onChange({ ...data, heading: e.target.value })}
      />
      <textarea
        className="w-full border rounded p-2 min-h-[100px]"
        placeholder="Body text"
        value={data.body || ""}
        onChange={(e) => onChange({ ...data, body: e.target.value })}
      />
    </div>
  );
}

export function TableEditor({ data, onChange }: EditorProps) {
  const columns: string[] = data.columns || [];
  const rows: string[][] = data.rows || [];

  const updateColumn = (i: number, val: string) => {
    const next = [...columns];
    next[i] = val;
    onChange({ ...data, columns: next });
  };
  const addColumn = () => onChange({ ...data, columns: [...columns, ""], rows: rows.map((r) => [...r, ""]) });
  const removeColumn = (i: number) =>
    onChange({ ...data, columns: columns.filter((_, ci) => ci !== i), rows: rows.map((r) => r.filter((_, ci) => ci !== i)) });

  const updateCell = (ri: number, ci: number, val: string) => {
    const next = rows.map((r) => [...r]);
    next[ri][ci] = val;
    onChange({ ...data, rows: next });
  };
  const addRow = () => onChange({ ...data, rows: [...rows, columns.map(() => "")] });
  const removeRow = (ri: number) => onChange({ ...data, rows: rows.filter((_, i) => i !== ri) });

  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded p-2"
        placeholder="Table heading (e.g. Table 1: Features)"
        value={data.heading || ""}
        onChange={(e) => onChange({ ...data, heading: e.target.value })}
      />

      <textarea
        className="w-full border rounded p-2 min-h-[60px]"
        placeholder="Short description (optional, shown between heading and table)"
        value={data.description || ""}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
      />

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="border p-1">
                  <div className="flex gap-1">
                    <input className="w-full border rounded p-1" value={col} onChange={(e) => updateColumn(i, e.target.value)} />
                    <button type="button" onClick={() => removeColumn(i)} className="text-red-500 px-1">✕</button>
                  </div>
                </th>
              ))}
              <th className="border p-1">
                <button type="button" onClick={addColumn} className="text-blue-600 px-2">+ col</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border p-1">
                    <input className="w-full border rounded p-1" value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)} />
                  </td>
                ))}
                <td className="border p-1">
                  <button type="button" onClick={() => removeRow(ri)} className="text-red-500 px-1">✕ row</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="text-blue-600 text-sm">+ Add row</button>
    </div>
  );
}

export function InvestmentEditor({ data, onChange }: EditorProps) {
  const items: any[] = data.items || [];
  const terms: string[] = data.paymentTerms || [];

  const updateItem = (i: number, key: string, val: any) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...data, items: next });
  };
  const addItem = () => onChange({ ...data, items: [...items, { item: "", note: "", amount: 0 }] });
  const removeItem = (i: number) => onChange({ ...data, items: items.filter((_, idx) => idx !== i) });

  const updateTerm = (i: number, val: string) => {
    const next = [...terms];
    next[i] = val;
    onChange({ ...data, paymentTerms: next });
  };
  const addTerm = () => onChange({ ...data, paymentTerms: [...terms, ""] });
  const removeTerm = (i: number) => onChange({ ...data, paymentTerms: terms.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <input
        className="w-full border rounded p-2"
        placeholder="Heading"
        value={data.heading || ""}
        onChange={(e) => onChange({ ...data, heading: e.target.value })}
      />

      {items.map((it, i) => (
        <div key={i} className="flex gap-2 items-start border p-2 rounded">
          <input className="flex-1 border rounded p-1" placeholder="Item" value={it.item} onChange={(e) => updateItem(i, "item", e.target.value)} />
          <input className="flex-1 border rounded p-1" placeholder="Note (optional)" value={it.note} onChange={(e) => updateItem(i, "note", e.target.value)} />
          <input
            type="number"
            className="w-32 border rounded p-1"
            placeholder="Amount"
            value={it.amount}
            onChange={(e) => updateItem(i, "amount", Number(e.target.value))}
          />
          <button type="button" onClick={() => removeItem(i)} className="text-red-500">✕</button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-blue-600 text-sm">+ Add item</button>

      <div className="pt-2 border-t">
        <p className="text-sm font-medium mb-1">Payment Terms</p>
        {terms.map((t, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input className="flex-1 border rounded p-1" value={t} onChange={(e) => updateTerm(i, e.target.value)} />
            <button type="button" onClick={() => removeTerm(i)} className="text-red-500">✕</button>
          </div>
        ))}
        <button type="button" onClick={addTerm} className="text-blue-600 text-sm">+ Add term</button>
      </div>
    </div>
  );
}

export function ContactEditor({ data, onChange }: EditorProps) {
  const rows: any[] = data.rows || [];
  const updateRow = (i: number, key: string, val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...data, rows: next });
  };
  const addRow = () => onChange({ ...data, rows: [...rows, { label: "", value: "" }] });
  const removeRow = (i: number) => onChange({ ...data, rows: rows.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded p-2"
        placeholder="Heading"
        value={data.heading || ""}
        onChange={(e) => onChange({ ...data, heading: e.target.value })}
      />
      <input
        className="w-full border rounded p-2"
        placeholder="Subheading (optional)"
        value={data.subheading || ""}
        onChange={(e) => onChange({ ...data, subheading: e.target.value })}
      />
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input className="w-40 border rounded p-1" placeholder="Label" value={r.label} onChange={(e) => updateRow(i, "label", e.target.value)} />
          <input className="flex-1 border rounded p-1" placeholder="Value" value={r.value} onChange={(e) => updateRow(i, "value", e.target.value)} />
          <button type="button" onClick={() => removeRow(i)} className="text-red-500">✕</button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="text-blue-600 text-sm">+ Add row</button>
    </div>
  );
}

export function ThankYouEditor({ data, onChange }: EditorProps) {
  return (
    <input
      className="w-full border rounded p-2"
      placeholder="Heading (default: Thank You)"
      value={data.heading || ""}
      onChange={(e) => onChange({ ...data, heading: e.target.value })}
    />
  );
}

export function CustomEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded p-2"
        placeholder="Heading (optional)"
        value={data.heading || ""}
        onChange={(e) => onChange({ ...data, heading: e.target.value })}
      />
      <textarea
        className="w-full border rounded p-2 min-h-[100px] font-mono text-xs"
        placeholder="Custom HTML"
        value={data.htmlSnippet || ""}
        onChange={(e) => onChange({ ...data, htmlSnippet: e.target.value })}
      />
    </div>
  );
}

export function BulletsEditor({ data, onChange }: EditorProps) {
  const items: string[] = data.items || [];

  const updateItem = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange({ ...data, items: next });
  };
  const addItem = () => onChange({ ...data, items: [...items, ""] });
  const removeItem = (i: number) => onChange({ ...data, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <input
        className="w-full border rounded p-2 font-semibold"
        placeholder="Main Heading (optional, e.g. '3. Core Modules')"
        value={data.mainHeading || ""}
        onChange={(e) => onChange({ ...data, mainHeading: e.target.value })}
      />
      <input
        className="w-full border rounded p-2"
        placeholder="Sub Heading (e.g. '3.1 Student Module')"
        value={data.heading || ""}
        onChange={(e) => onChange({ ...data, heading: e.target.value })}
      />

      <div className="pt-2 border-t">
        <p className="text-sm font-medium mb-1">Bullet Points</p>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input
              className="flex-1 border rounded p-1"
              placeholder={`Point ${i + 1}`}
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
            />
            <button type="button" onClick={() => removeItem(i)} className="text-red-500">✕</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-blue-600 text-sm">+ Add point</button>
      </div>
    </div>
  );
}