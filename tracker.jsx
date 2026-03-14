import { useState, useEffect, useRef } from "react";

// ── Persistent Storage Helpers ──────────────────────────────────────────────
const STORAGE_KEY = "medconsult-records";
async function loadRecords() {
  try {
    const r = await window.storage.get(STORAGE_KEY);
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}
async function saveRecords(records) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(records)); } catch {}
}

// ── Tax Helpers ──────────────────────────────────────────────────────────────
const TAX_RATES = [
  { label: "None (0%)", value: 0 },
  { label: "10%", value: 10 },
  { label: "30%", value: 30 },
  { label: "40%", value: 40 },
];
const calc = (bill, sharePct, taxPct) => {
  const myShare = (bill * sharePct) / 100;
  const taxAmt  = (myShare * taxPct) / 100;
  const net     = myShare - taxAmt;
  return { myShare, taxAmt, net };
};

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const EMPTY_FORM = {
  ptName: "", ptId: "", billDate: "", billAmount: "",
  sharePct: "30", taxPct: "0",
  paymentMode: "UPI", receiptDate: "", notes: "",
  status: "Pending",
};

// ── PRINT STYLES ─────────────────────────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #print-area, #print-area * { visibility: visible !important; }
  #print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; background: white; }
  .no-print { display: none !important; }
}`;

export default function App() {
  const [records, setRecords]   = useState([]);
  const [view, setView]         = useState("dashboard"); // dashboard | add | list | invoice
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadRecords().then(r => { setRecords(r); setLoading(false); });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const persist = async (updated) => {
    setRecords(updated);
    await saveRecords(updated);
  };

  const derived = (r) => calc(Number(r.billAmount), Number(r.sharePct), Number(r.taxPct));

  // ── Submit Form ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.ptName || !form.billDate || !form.billAmount) {
      showToast("Please fill Patient Name, Bill Date & Amount", "error"); return;
    }
    if (editId) {
      const updated = records.map(r => r.id === editId ? { ...r, ...form } : r);
      await persist(updated);
      showToast("Record updated successfully");
    } else {
      const newRec = { ...form, id: uid(), createdAt: new Date().toISOString() };
      await persist([newRec, ...records]);
      showToast("Record saved successfully");
    }
    setForm(EMPTY_FORM); setEditId(null); setView("list");
  };

  const handleEdit = (rec) => {
    setForm({ ...rec }); setEditId(rec.id); setView("add");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    await persist(records.filter(r => r.id !== id));
    showToast("Record deleted", "info");
  };

  // ── Export to CSV ────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Pt Name","Pt ID","Bill Date","Bill Amount","Share %","My Share","Tax %","Tax Amount","Net Receivable","Payment Mode","Receipt Date","Status","Notes"];
    const rows = records.map(r => {
      const d = derived(r);
      return [r.ptName, r.ptId, r.billDate, r.billAmount, r.sharePct, d.myShare.toFixed(2),
              r.taxPct, d.taxAmt.toFixed(2), d.net.toFixed(2),
              r.paymentMode, r.receiptDate, r.status, r.notes].map(v => `"${v}"`).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "MedConsult_Finance.csv"; a.click();
    showToast("CSV exported — open in Google Sheets");
  };

  const printInvoice = () => window.print();

  const shareRecord = async (rec) => {
    const d = derived(rec);
    const text = `Dr. Consultation Record\nPatient: ${rec.ptName} (${rec.ptId})\nBill Date: ${rec.billDate}\nBill Amount: ${fmt(rec.billAmount)}\nMy Share (${rec.sharePct}%): ${fmt(d.myShare)}\nTax (${rec.taxPct}%): ${fmt(d.taxAmt)}\nNet Receivable: ${fmt(d.net)}\nPayment: ${rec.paymentMode} | ${rec.status}`;
    if (navigator.share) {
      await navigator.share({ title: "Consultation Record", text });
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    }
  };

  // ── Dashboard Stats ──────────────────────────────────────────────────────
  const stats = records.reduce((acc, r) => {
    const d = derived(r);
    acc.totalBilled   += Number(r.billAmount);
    acc.totalMyShare  += d.myShare;
    acc.totalTax      += d.taxAmt;
    acc.totalNet      += d.net;
    if (r.status === "Received") acc.received += d.net;
    if (r.status === "Pending")  acc.pending  += d.net;
    return acc;
  }, { totalBilled: 0, totalMyShare: 0, totalTax: 0, totalNet: 0, received: 0, pending: 0 });

  // ── Filter Records ───────────────────────────────────────────────────────
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.ptName.toLowerCase().includes(q) || r.ptId.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const f = form;
  const fDerived = calc(Number(f.billAmount), Number(f.sharePct), Number(f.taxPct));

  if (loading) return (
    <div style={styles.loadWrap}>
      <div style={styles.spinner} />
      <p style={{ color: "#5C8A8A", marginTop: 16, fontFamily: "'DM Sans', sans-serif" }}>Loading records…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #EEF3F3; font-family: 'DM Sans', sans-serif; }
        ${PRINT_STYLE}
        input, select, textarea { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #B2CECE; border-radius: 3px; }
        .rec-row:hover { background: #F5FAFA !important; }
        .btn-hover:hover { opacity: 0.85; transform: translateY(-1px); }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* SIDEBAR */}
      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sideTop}>
            <div style={styles.logoWrap}>
              <span style={styles.logoIcon}>⚕</span>
              <div>
                <div style={styles.logoTitle}>MedFinance</div>
                <div style={styles.logoSub}>Consultation Tracker</div>
              </div>
            </div>
          </div>
          <nav style={styles.nav}>
            {[
              { id: "dashboard", icon: "◈", label: "Dashboard" },
              { id: "add",       icon: "＋", label: "New Entry" },
              { id: "list",      icon: "≡", label: "All Records" },
            ].map(n => (
              <div key={n.id} className="nav-item" onClick={() => { setView(n.id); setEditId(null); setForm(EMPTY_FORM); }}
                style={{ ...styles.navItem, ...(view === n.id ? styles.navActive : {}) }}>
                <span style={styles.navIcon}>{n.icon}</span> {n.label}
              </div>
            ))}
          </nav>
          <div style={styles.sideBottom}>
            <button className="btn-hover" onClick={exportCSV} style={styles.exportBtn}>
              ↓ Export to Google Sheets
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          {/* HEADER */}
          <header style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>
                { view === "dashboard" ? "Dashboard"
                : view === "add" ? (editId ? "Edit Record" : "New Consultation")
                : view === "list" ? "All Records"
                : "Invoice" }
              </h1>
              <p style={styles.pageDate}>{new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn-hover" style={styles.headerBtn} onClick={printInvoice}>🖨 Print</button>
              <button className="btn-hover" style={{ ...styles.headerBtn, background:"#0F4C5C", color:"#fff" }}
                onClick={() => { setView("add"); setForm(EMPTY_FORM); setEditId(null); }}>＋ New Entry</button>
            </div>
          </header>

          <div style={styles.content}>

            {/* ── DASHBOARD ─────────────────────────────────────────────── */}
            {view === "dashboard" && (
              <div id="print-area">
                <div style={styles.statsGrid}>
                  {[
                    { label:"Total Billed",    val: fmt(stats.totalBilled),  color:"#0F4C5C", icon:"📋" },
                    { label:"My Share Total",  val: fmt(stats.totalMyShare), color:"#1A7A5E", icon:"💰" },
                    { label:"Tax Deducted",    val: fmt(stats.totalTax),     color:"#C0392B", icon:"📊" },
                    { label:"Net Receivable",  val: fmt(stats.totalNet),     color:"#7D3C98", icon:"🏦" },
                    { label:"Received",        val: fmt(stats.received),     color:"#1A7A5E", icon:"✅" },
                    { label:"Pending",         val: fmt(stats.pending),      color:"#D4A853", icon:"⏳" },
                  ].map(s => (
                    <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
                      <span style={styles.statIcon}>{s.icon}</span>
                      <div style={{ ...styles.statVal, color: s.color }}>{s.val}</div>
                      <div style={styles.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={styles.recentWrap}>
                  <div style={styles.sectionHead}>
                    <span style={styles.sectionTitle}>Recent Consultations</span>
                    <span style={{ ...styles.badge, background:"#E8F4F4", color:"#0F4C5C" }}>{records.length} total</span>
                  </div>
                  {records.slice(0, 5).map(r => {
                    const d = derived(r);
                    return (
                      <div key={r.id} className="rec-row" style={styles.recRow}
                        onClick={() => { setSelectedRecord(r); setView("invoice"); }}>
                        <div style={styles.recLeft}>
                          <div style={styles.recAvatar}>{r.ptName[0]?.toUpperCase()}</div>
                          <div>
                            <div style={styles.recName}>{r.ptName}</div>
                            <div style={styles.recMeta}>ID: {r.ptId} · {r.billDate}</div>
                          </div>
                        </div>
                        <div style={styles.recRight}>
                          <div style={styles.recAmt}>{fmt(d.net)}</div>
                          <div style={{ ...styles.statusBadge, ...(r.status==="Received" ? styles.statusGreen : styles.statusAmber) }}>{r.status}</div>
                        </div>
                      </div>
                    );
                  })}
                  {records.length === 0 && <div style={styles.empty}>No records yet. Add your first consultation ↗</div>}
                </div>
              </div>
            )}

            {/* ── ADD / EDIT FORM ────────────────────────────────────────── */}
            {view === "add" && (
              <div style={styles.formCard}>
                <div style={styles.formGrid}>
                  <Field label="Patient Name *" value={f.ptName} onChange={v => setForm({...f, ptName:v})} placeholder="e.g. Ajay Sharma" />
                  <Field label="Patient ID *" value={f.ptId} onChange={v => setForm({...f, ptId:v})} placeholder="e.g. 0001" />
                  <Field label="Bill Date *" type="date" value={f.billDate} onChange={v => setForm({...f, billDate:v})} />
                  <Field label="Bill Amount (₹) *" type="number" value={f.billAmount} onChange={v => setForm({...f, billAmount:v})} placeholder="0.00" />
                  <FieldSelect label="My Share %" value={f.sharePct} onChange={v => setForm({...f, sharePct:v})}
                    options={["10","20","25","30","35","40","50"].map(x=>({label:`${x}%`,value:x}))} />
                  <FieldSelect label="Tax Deduction" value={f.taxPct} onChange={v => setForm({...f, taxPct:v})}
                    options={TAX_RATES.map(t=>({label:t.label, value:String(t.value)}))} />
                  <FieldSelect label="Payment Mode" value={f.paymentMode} onChange={v => setForm({...f, paymentMode:v})}
                    options={["Cheque","UPI","Bank Transfer","Cash"].map(x=>({label:x, value:x}))} />
                  <Field label="Date of Receipt" type="date" value={f.receiptDate} onChange={v => setForm({...f, receiptDate:v})} />
                  <FieldSelect label="Status" value={f.status} onChange={v => setForm({...f, status:v})}
                    options={["Pending","Received","Partial"].map(x=>({label:x,value:x}))} />
                  <Field label="Notes" value={f.notes} onChange={v => setForm({...f, notes:v})} placeholder="Optional" />
                </div>

                {/* Live Calculation Panel */}
                {f.billAmount > 0 && (
                  <div style={styles.calcPanel}>
                    <div style={styles.calcTitle}>Live Calculation</div>
                    <div style={styles.calcGrid}>
                      <CalcRow label="Bill Amount"         val={fmt(f.billAmount)} />
                      <CalcRow label={`My Share (${f.sharePct}%)`} val={fmt(fDerived.myShare)} highlight />
                      <CalcRow label={`Tax Deduction (${f.taxPct}%)`} val={`− ${fmt(fDerived.taxAmt)}`} red />
                      <div style={styles.calcDivider}/>
                      <CalcRow label="Final Net Receivable" val={fmt(fDerived.net)} big />
                    </div>
                  </div>
                )}

                <div style={styles.formActions}>
                  <button className="btn-hover" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setView("list"); }}
                    style={styles.cancelBtn}>Cancel</button>
                  <button className="btn-hover" onClick={handleSubmit} style={styles.saveBtn}>
                    {editId ? "Update Record" : "Save Record"}
                  </button>
                </div>
              </div>
            )}

            {/* ── RECORDS LIST ──────────────────────────────────────────── */}
            {view === "list" && (
              <div>
                <div style={styles.listControls}>
                  <input style={styles.searchInput} placeholder="🔍  Search by name or ID…"
                    value={search} onChange={e => setSearch(e.target.value)} />
                  <div style={styles.filterRow}>
                    {["All","Pending","Received","Partial"].map(s => (
                      <button key={s} onClick={() => setFilterStatus(s)} className="btn-hover"
                        style={{ ...styles.filterBtn, ...(filterStatus===s ? styles.filterActive : {}) }}>{s}</button>
                    ))}
                  </div>
                </div>

                <div id="print-area">
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.thead}>
                          {["Pt Name","Pt ID","Bill Date","Bill Amt","My Share","Tax","Net Receivable","Mode","Status","Actions"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(r => {
                          const d = derived(r);
                          return (
                            <tr key={r.id} className="rec-row" style={styles.tr}>
                              <td style={styles.td}><b>{r.ptName}</b></td>
                              <td style={styles.td}>{r.ptId}</td>
                              <td style={styles.td}>{r.billDate}</td>
                              <td style={styles.td}>{fmt(r.billAmount)}</td>
                              <td style={styles.td}>{fmt(d.myShare)}</td>
                              <td style={{ ...styles.td, color:"#C0392B" }}>−{fmt(d.taxAmt)}</td>
                              <td style={{ ...styles.td, fontWeight:600, color:"#0F4C5C" }}>{fmt(d.net)}</td>
                              <td style={styles.td}>{r.paymentMode}</td>
                              <td style={styles.td}>
                                <span style={{ ...styles.statusBadge, ...(r.status==="Received"?styles.statusGreen:r.status==="Partial"?styles.statusBlue:styles.statusAmber) }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <div style={{ display:"flex", gap:6 }}>
                                  <ActionBtn icon="👁" onClick={() => { setSelectedRecord(r); setView("invoice"); }} title="View" />
                                  <ActionBtn icon="✏️" onClick={() => handleEdit(r)} title="Edit" />
                                  <ActionBtn icon="📤" onClick={() => shareRecord(r)} title="Share" />
                                  <ActionBtn icon="🗑" onClick={() => handleDelete(r.id)} title="Delete" red />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filtered.length === 0 && (
                          <tr><td colSpan={10} style={styles.empty}>No records found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── INVOICE VIEW ──────────────────────────────────────────── */}
            {view === "invoice" && selectedRecord && (() => {
              const r = selectedRecord;
              const d = derived(r);
              return (
                <div id="print-area">
                  <div style={styles.invoice}>
                    <div style={styles.invoiceHeader}>
                      <div>
                        <div style={styles.invoiceTitle}>CONSULTATION RECEIPT</div>
                        <div style={styles.invoiceId}>Record ID: {r.id.toUpperCase()}</div>
                      </div>
                      <div style={styles.logoIcon2}>⚕</div>
                    </div>
                    <div style={styles.invoiceDivider}/>
                    <div style={styles.invoiceGrid}>
                      <InvoiceRow label="Patient Name"   val={r.ptName} />
                      <InvoiceRow label="Patient ID"     val={r.ptId} />
                      <InvoiceRow label="Bill Date"      val={r.billDate} />
                      <InvoiceRow label="Payment Mode"   val={r.paymentMode} />
                      <InvoiceRow label="Date of Receipt" val={r.receiptDate || "—"} />
                      <InvoiceRow label="Status"         val={r.status} highlight />
                    </div>
                    <div style={styles.invoiceDivider}/>
                    <div style={styles.invoiceCalc}>
                      <CalcRow label="Bill Amount"               val={fmt(r.billAmount)} />
                      <CalcRow label={`Consultation Share (${r.sharePct}%)`} val={fmt(d.myShare)} highlight />
                      <CalcRow label={`TDS / Tax (${r.taxPct}%)`}          val={`− ${fmt(d.taxAmt)}`} red />
                      <div style={styles.calcDivider}/>
                      <CalcRow label="Final Net Receivable"      val={fmt(d.net)} big />
                    </div>
                    {r.notes && <div style={styles.invoiceNotes}>Notes: {r.notes}</div>}
                    <div style={{ ...styles.invoiceDivider, marginTop:24 }}/>
                    <div style={styles.invoiceFooter}>
                      Generated by MedFinance · {new Date().toLocaleDateString("en-IN")}
                    </div>
                    <div style={{ display:"flex", gap:12, marginTop:24 }} className="no-print">
                      <button className="btn-hover" onClick={printInvoice} style={styles.saveBtn}>🖨 Print Invoice</button>
                      <button className="btn-hover" onClick={() => shareRecord(r)} style={styles.cancelBtn}>📤 Share</button>
                      <button className="btn-hover" onClick={() => setView("list")} style={styles.cancelBtn}>← Back</button>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type==="error"?"#C0392B":toast.type==="info"?"#2980b9":"#1A7A5E" }}>
          {toast.msg}
        </div>
      )}
    </>
  );
}

// ── Small Components ──────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type="text", placeholder="" }) => (
  <div style={styles.fieldWrap}>
    <label style={styles.label}>{label}</label>
    <input style={styles.input} type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} />
  </div>
);
const FieldSelect = ({ label, value, onChange, options }) => (
  <div style={styles.fieldWrap}>
    <label style={styles.label}>{label}</label>
    <select style={styles.input} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const CalcRow = ({ label, val, highlight, red, big }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0",
    borderBottom: big ? "none" : "1px solid #EEF3F3" }}>
    <span style={{ fontSize: big?15:13, fontWeight: big?600:400, color:"#4A6A6A" }}>{label}</span>
    <span style={{ fontSize: big?18:14, fontWeight: big?700:500,
      color: big?"#0F4C5C" : red?"#C0392B" : highlight?"#1A7A5E" : "#333" }}>{val}</span>
  </div>
);
const InvoiceRow = ({ label, val, highlight }) => (
  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0",
    borderBottom:"1px solid #EEF3F3" }}>
    <span style={{ color:"#7A9A9A", fontSize:13 }}>{label}</span>
    <span style={{ fontWeight:600, color: highlight?"#1A7A5E":"#1A2A2A", fontSize:14 }}>{val}</span>
  </div>
);
const ActionBtn = ({ icon, onClick, title, red }) => (
  <button title={title} onClick={onClick} className="btn-hover"
    style={{ background: red?"#FEF0F0":"#F0F7F7", border:"none", borderRadius:6,
      cursor:"pointer", padding:"4px 8px", fontSize:14, color: red?"#C0392B":"#0F4C5C",
      transition:"all 0.15s" }}>
    {icon}
  </button>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  layout:      { display:"flex", minHeight:"100vh", fontFamily:"'DM Sans', sans-serif" },
  sidebar:     { width:240, background:"linear-gradient(160deg, #0F4C5C 0%, #1A7A5E 100%)",
                 display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh" },
  sideTop:     { padding:"28px 20px 20px" },
  logoWrap:    { display:"flex", alignItems:"center", gap:12 },
  logoIcon:    { fontSize:28, background:"rgba(255,255,255,0.15)", borderRadius:10,
                 width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center" },
  logoIcon2:   { fontSize:40, opacity:0.3 },
  logoTitle:   { color:"#fff", fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, lineHeight:1.2 },
  logoSub:     { color:"rgba(255,255,255,0.55)", fontSize:11, marginTop:2 },
  nav:         { flex:1, padding:"12px 12px" },
  navItem:     { display:"flex", alignItems:"center", gap:10, color:"rgba(255,255,255,0.7)",
                 padding:"11px 14px", borderRadius:10, cursor:"pointer",
                 transition:"background 0.15s", fontSize:14, fontWeight:500, marginBottom:4 },
  navActive:   { background:"rgba(255,255,255,0.18)", color:"#fff" },
  navIcon:     { fontSize:16, width:20, textAlign:"center" },
  sideBottom:  { padding:"20px" },
  exportBtn:   { width:"100%", background:"rgba(212,168,83,0.9)", color:"#1A1A1A", border:"none",
                 borderRadius:10, padding:"11px 0", cursor:"pointer", fontWeight:600, fontSize:13,
                 transition:"all 0.2s", fontFamily:"'DM Sans', sans-serif" },
  main:        { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  header:      { background:"#fff", borderBottom:"1px solid #E0EBEB", padding:"18px 32px",
                 display:"flex", justifyContent:"space-between", alignItems:"center",
                 position:"sticky", top:0, zIndex:10 },
  pageTitle:   { fontFamily:"'Playfair Display', serif", fontSize:22, color:"#0F2A2A", fontWeight:700 },
  pageDate:    { color:"#7A9A9A", fontSize:12, marginTop:3 },
  headerBtn:   { background:"#F0F7F7", border:"1px solid #CCDEDE", borderRadius:9, padding:"8px 16px",
                 cursor:"pointer", fontSize:13, fontWeight:500, color:"#0F4C5C",
                 transition:"all 0.2s", fontFamily:"'DM Sans', sans-serif" },
  content:     { flex:1, padding:"28px 32px", overflowY:"auto" },
  statsGrid:   { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:28 },
  statCard:    { background:"#fff", borderRadius:14, padding:"20px 22px",
                 boxShadow:"0 2px 8px rgba(15,76,92,0.06)", display:"flex",
                 flexDirection:"column", gap:8 },
  statIcon:    { fontSize:22 },
  statVal:     { fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700 },
  statLabel:   { color:"#7A9A9A", fontSize:12, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.5px" },
  recentWrap:  { background:"#fff", borderRadius:14, padding:"20px 24px",
                 boxShadow:"0 2px 8px rgba(15,76,92,0.06)" },
  sectionHead: { display:"flex", alignItems:"center", gap:10, marginBottom:16 },
  sectionTitle:{ fontFamily:"'Playfair Display', serif", fontSize:17, color:"#0F2A2A", fontWeight:700 },
  badge:       { borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600 },
  recRow:      { display:"flex", justifyContent:"space-between", alignItems:"center",
                 padding:"12px 10px", borderBottom:"1px solid #F0F7F7", cursor:"pointer",
                 borderRadius:8, transition:"background 0.15s" },
  recLeft:     { display:"flex", alignItems:"center", gap:12 },
  recAvatar:   { width:36, height:36, borderRadius:"50%", background:"#E8F4F4",
                 color:"#0F4C5C", display:"flex", alignItems:"center", justifyContent:"center",
                 fontWeight:700, fontSize:15 },
  recName:     { fontWeight:600, color:"#1A2A2A", fontSize:14 },
  recMeta:     { color:"#8AACAC", fontSize:12, marginTop:2 },
  recRight:    { display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 },
  recAmt:      { fontWeight:700, color:"#0F4C5C", fontSize:15 },
  statusBadge: { borderRadius:20, padding:"3px 9px", fontSize:11, fontWeight:600 },
  statusGreen: { background:"#E8F5F0", color:"#1A7A5E" },
  statusAmber: { background:"#FEF8EC", color:"#D4A853" },
  statusBlue:  { background:"#EBF3FE", color:"#2980b9" },
  empty:       { color:"#AACACA", textAlign:"center", padding:"32px 0", fontSize:14 },
  formCard:    { background:"#fff", borderRadius:14, padding:"28px 32px",
                 boxShadow:"0 2px 8px rgba(15,76,92,0.06)", maxWidth:820 },
  formGrid:    { display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:18, marginBottom:24 },
  fieldWrap:   { display:"flex", flexDirection:"column", gap:6 },
  label:       { fontSize:12, fontWeight:600, color:"#5A7A7A", textTransform:"uppercase", letterSpacing:"0.5px" },
  input:       { border:"1.5px solid #D0E4E4", borderRadius:9, padding:"10px 13px", fontSize:14,
                 color:"#1A2A2A", outline:"none", background:"#FAFEFE",
                 transition:"border-color 0.15s" },
  calcPanel:   { background:"#F5FAFA", borderRadius:12, padding:"20px 24px", marginBottom:20,
                 border:"1px solid #D4EAEA" },
  calcTitle:   { fontSize:12, fontWeight:700, color:"#7AACAC", textTransform:"uppercase",
                 letterSpacing:"1px", marginBottom:14 },
  calcGrid:    { maxWidth:340 },
  calcDivider: { borderBottom:"2px solid #D4EAEA", margin:"10px 0" },
  formActions: { display:"flex", gap:12, justifyContent:"flex-end" },
  saveBtn:     { background:"linear-gradient(135deg, #0F4C5C, #1A7A5E)", color:"#fff",
                 border:"none", borderRadius:10, padding:"12px 28px", cursor:"pointer",
                 fontSize:14, fontWeight:600, transition:"all 0.2s", fontFamily:"'DM Sans', sans-serif" },
  cancelBtn:   { background:"#F0F7F7", color:"#0F4C5C", border:"1.5px solid #CCDEDE",
                 borderRadius:10, padding:"12px 24px", cursor:"pointer",
                 fontSize:14, fontWeight:500, transition:"all 0.2s", fontFamily:"'DM Sans', sans-serif" },
  listControls:{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap", alignItems:"center" },
  searchInput: { flex:1, minWidth:200, border:"1.5px solid #D0E4E4", borderRadius:9,
                 padding:"10px 16px", fontSize:14, color:"#1A2A2A", outline:"none",
                 background:"#fff", fontFamily:"'DM Sans', sans-serif" },
  filterRow:   { display:"flex", gap:8 },
  filterBtn:   { background:"#F0F7F7", color:"#5A7A7A", border:"1px solid #D0E4E4",
                 borderRadius:8, padding:"8px 15px", cursor:"pointer", fontSize:13,
                 fontWeight:500, transition:"all 0.15s", fontFamily:"'DM Sans', sans-serif" },
  filterActive:{ background:"#0F4C5C", color:"#fff", border:"1px solid #0F4C5C" },
  tableWrap:   { background:"#fff", borderRadius:14, overflow:"hidden",
                 boxShadow:"0 2px 8px rgba(15,76,92,0.06)", overflowX:"auto" },
  table:       { width:"100%", borderCollapse:"collapse" },
  thead:       { background:"#EEF5F5" },
  th:          { padding:"13px 14px", textAlign:"left", fontSize:11, fontWeight:700,
                 color:"#5A8A8A", textTransform:"uppercase", letterSpacing:"0.5px",
                 whiteSpace:"nowrap" },
  tr:          { borderBottom:"1px solid #F0F7F7", transition:"background 0.12s" },
  td:          { padding:"12px 14px", fontSize:13, color:"#2A3A3A", whiteSpace:"nowrap" },
  invoice:     { background:"#fff", borderRadius:14, padding:"36px 40px", maxWidth:620,
                 boxShadow:"0 4px 20px rgba(15,76,92,0.1)" },
  invoiceHeader:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  invoiceTitle: { fontFamily:"'Playfair Display', serif", fontSize:22, color:"#0F2A2A", fontWeight:700 },
  invoiceId:   { color:"#8AACAC", fontSize:12, marginTop:5 },
  invoiceDivider:{ border:"none", borderTop:"2px solid #E8F0F0", margin:"20px 0" },
  invoiceGrid: { display:"flex", flexDirection:"column", gap:2 },
  invoiceCalc: { background:"#F5FAFA", borderRadius:10, padding:"18px 20px" },
  invoiceNotes:{ background:"#FFF8EC", borderRadius:8, padding:"12px 16px",
                 fontSize:13, color:"#7A6A2A", marginTop:16 },
  invoiceFooter:{ textAlign:"center", fontSize:11, color:"#AACACA" },
  toast:       { position:"fixed", bottom:28, right:28, color:"#fff", borderRadius:10,
                 padding:"13px 22px", fontSize:14, fontWeight:600,
                 boxShadow:"0 6px 24px rgba(0,0,0,0.2)", zIndex:1000 },
  loadWrap:    { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                 minHeight:"100vh", background:"#EEF3F3" },
  spinner:     { width:36, height:36, border:"3px solid #D0E4E4",
                 borderTop:"3px solid #0F4C5C", borderRadius:"50%",
                 animation:"spin 0.8s linear infinite" },
};
