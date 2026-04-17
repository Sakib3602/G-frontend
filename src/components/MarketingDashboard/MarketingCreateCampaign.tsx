import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import { useMutation } from "@tanstack/react-query";
import Alert from "./Alert/Alert";

type CampaignFormData = {
  campaignName: string;
  channel: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  targetLeads: number;
};


export type CampaignForm = CampaignFormData & {
    marketerId: string;
};
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

  :root {
    --gold-light: #f5ecd1;
    --gold-mid: #b89a53;
    --gold-dark: #876f35;
    --gold-deep: #2f2612;
    --gold-glow: rgba(148, 163, 184, 0.16);
    --gold-subtle: rgba(148, 163, 184, 0.08);
    --gold-border: rgba(148, 163, 184, 0.24);
    --gold-border-mid: rgba(148, 163, 184, 0.36);
    --white: #ffffff;
    --off-white: #f8fafc;
    --text-primary: #111827;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --error: #C0392B;
    --error-bg: #FEF2F0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes successPop {
    0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes lineFill {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes pulseRing {
    0%, 100% { box-shadow: 0 0 0 0px #C9A84C44; }
    50%       { box-shadow: 0 0 0 6px #C9A84C22; }
  }

  .mcf-wrap * { box-sizing: border-box; }

  .mcf-wrap {
    font-family: 'Poppins', sans-serif;
    background: rgba(248, 250, 252, 0.6);
    border: 1px solid var(--gold-border);
    border-radius: 24px;
    padding: 2.5rem 2rem 1.6rem;
    max-width: 620px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(40, 34, 20, 0.06);
  }

  .mcf-shimmer-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.14), rgba(148, 163, 184, 0.26), rgba(148, 163, 184, 0.14), transparent);
    background-size: 300% auto;
    animation: shimmer 4s linear infinite;
  }

  .mcf-corner {
    position: absolute;
    width: 48px; height: 48px;
    opacity: 0.18;
  }
  .mcf-corner-tl { top: 12px; left: 12px; border-top: 1.5px solid var(--gold-mid); border-left: 1.5px solid var(--gold-mid); border-radius: 6px 0 0 0; }
  .mcf-corner-br { bottom: 12px; right: 12px; border-bottom: 1.5px solid var(--gold-mid); border-right: 1.5px solid var(--gold-mid); border-radius: 0 0 6px 0; }

  .mcf-header { margin-bottom: 1.35rem; }
  .mcf-eyebrow {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold-mid);
    margin-bottom: 6px;
  }
  .mcf-title {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px;
    line-height: 1.2;
  }
  .mcf-subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }

  /* Step Indicators */
  .mcf-steps {
    display: flex;
    align-items: center;
    margin-bottom: 1.45rem;
  }
  .mcf-step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  .mcf-step-circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.35s ease;
    position: relative;
  }
  .mcf-step-circle.active {
    background: linear-gradient(135deg, var(--gold-mid), var(--gold-light));
    color: var(--gold-deep);
    animation: pulseRing 2.5s ease infinite;
  }
  .mcf-step-circle.done {
    background: rgba(184, 154, 83, 0.12);
    border: 1px solid rgba(184, 154, 83, 0.35);
    color: var(--gold-mid);
  }
  .mcf-step-circle.idle {
    background: var(--off-white);
    border: 1px solid #D8CEBC;
    color: var(--text-muted);
  }
  .mcf-step-label {
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    transition: color 0.3s;
  }
  .mcf-step-line {
    flex: 1;
    height: 1.5px;
    background: #E4DACC;
    margin: 0 10px;
    margin-bottom: 18px;
    position: relative;
    overflow: hidden;
    border-radius: 2px;
  }
  .mcf-step-line-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--gold-mid), var(--gold-light));
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2px;
  }

  /* Panel */
  .mcf-panel {
    animation: fadeUp 0.35s ease both;
  }

  /* Field */
  .mcf-field { margin-bottom: 1rem; }
  .mcf-field:last-child { margin-bottom: 0; }
  .mcf-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 7px;
  }
  .mcf-input-wrap { position: relative; }
  .mcf-prefix {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 14px;
    pointer-events: none;
  }
  .mcf-input, .mcf-select {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--gold-border);
    border-radius: 10px;
    background: var(--white);
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    appearance: none;
  }
  .mcf-input::placeholder { color: #C8BBAA; }
  .mcf-input:focus, .mcf-select:focus {
    border-color: #94a3b8;
    box-shadow: 0 0 0 3px var(--gold-glow);
    background: #ffffff;
  }
  .mcf-input.has-prefix { padding-left: 28px; }
  .mcf-input.error { border-color: var(--error); box-shadow: 0 0 0 3px #C0392B1A; background: var(--error-bg); }
  .mcf-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C9A84C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    cursor: pointer;
  }
  .mcf-select.error { border-color: var(--error); box-shadow: 0 0 0 3px #C0392B1A; background-color: var(--error-bg); }
  .mcf-error-msg {
    font-size: 12px;
    color: var(--error);
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .mcf-error-msg::before { content: '✕'; font-size: 10px; }

  /* Grid */
  .mcf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* Review */
  .mcf-review {
    background: #ffffff;
    border: 1px solid var(--gold-border);
    border-radius: 12px;
    padding: 0.95rem 1.1rem;
    margin-top: 1rem;
    box-shadow: 0 10px 28px rgba(32, 26, 14, 0.03);
  }
  .mcf-review-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--gold-border);
  }
  .mcf-review-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold-mid); }
  .mcf-review-title {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .mcf-review-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 8px 0;
    border-bottom: 1px solid var(--gold-border);
  }
  .mcf-review-row:last-child { border-bottom: none; padding-bottom: 0; }
  .mcf-review-key { font-size: 12px; color: var(--text-muted); }
  .mcf-review-val { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .mcf-review-val.gold { color: #334155; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600; }

  /* Buttons */
  .mcf-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.35rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gold-border);
  }
  .mcf-btn-back {
    background: transparent;
    border: 1px solid var(--gold-border-mid);
    color: var(--gold-dark);
    padding: 10px 20px;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .mcf-btn-back:hover:not(:disabled) { background: var(--gold-subtle); border-color: var(--gold-mid); }
  .mcf-btn-back:active:not(:disabled) { transform: scale(0.97); }
  .mcf-btn-back:disabled { opacity: 0.3; cursor: not-allowed; }
  .mcf-btn-next {
    background: linear-gradient(135deg, var(--gold-mid) 0%, var(--gold-light) 50%, var(--gold-mid) 100%);
    background-size: 200% auto;
    color: var(--gold-deep);
    border: none;
    padding: 10px 24px;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-position 0.4s ease, transform 0.15s ease, box-shadow 0.2s ease;
    box-shadow: 0 3px 14px var(--gold-glow);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .mcf-btn-next:hover { background-position: right center; transform: translateY(-1px); box-shadow: 0 5px 20px rgba(199, 168, 74, 0.35); }
  .mcf-btn-next:active { transform: scale(0.97); }

  /* Dots */
  .mcf-dots { display: flex; align-items: center; gap: 6px; }
  .mcf-dot {
    height: 6px;
    border-radius: 4px;
    background: #D8CEBC;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .mcf-dot.active { width: 20px; background: var(--gold-mid); }
  .mcf-dot.inactive { width: 6px; }

  /* Success */
  .mcf-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem 1rem 0.9rem;
    animation: fadeUp 0.4s ease both;
  }
  .mcf-success-icon {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: linear-gradient(135deg, #94a3b8, #cbd5e1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
    box-shadow: 0 6px 24px var(--gold-glow);
  }
  .mcf-success-title {
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px;
  }
  .mcf-success-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0 0 2rem;
    max-width: 280px;
  }
  .mcf-divider {
    width: 48px;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, #94a3b8, transparent);
    margin: 0 auto 1.5rem;
  }
`;



const MarketingCreateCampaign = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<CampaignFormData | null>(null);

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!showNotification) return;

    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showNotification]);
  
  const {userData}  = useUserDataMarketing()
  // console.log("User data in MarketingCreateCampaign:", userData);
  const axiosMarketer = useAxiosMarketing()

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset: resetForm,
    control,
    formState: { errors },
  } = useForm<CampaignFormData>({ mode: "onBlur" });

  const values = useWatch({ control }) as Partial<CampaignFormData> | undefined;

  const getPerDayCost = (): number | null => {
    if (!values?.startDate || !values?.endDate || !values?.totalBudget) return null;

    const startDate = new Date(values.startDate);
    const endDate = new Date(values.endDate);
    const dayDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (!Number.isFinite(dayDifference) || dayDifference <= 0) return null;

    return values.totalBudget / dayDifference;
  };

  const perDayCost = getPerDayCost();

  const nextStep = async () => {
    let fields: (keyof CampaignFormData)[] = [];
    if (step === 1) fields = ["campaignName", "channel"];
    if (step === 2) fields = ["startDate", "endDate", "totalBudget"];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = (data: CampaignFormData) => {
    const submittedPerDayCost = getPerDayCost();

    console.log("Launch campaign clicked:", {
      ...data,
      perDayCost: submittedPerDayCost,

    });

    const dataFOrCreate = {
      ...data,
    perDayCost: getPerDayCost(),
    marketerId: userData?._id

    }

   

  
    mutationCreateCampaign.mutate(dataFOrCreate);


    setSubmittedData(data);
    resetForm();
    setStep(1);
    setSubmitted(true);
  };

  const mutationCreateCampaign = useMutation({
    mutationFn: async(data: CampaignForm)=>{
      const res = await axiosMarketer.post("/campaigns/create-campaign",data)
      return res.data;
    },
      onSuccess: () => {
        setShowNotification(true);  
      },
      onError: (error)=>{
        console.error("Error creating campaign:", error);
      }
    
  })

  const handleCreateAnother = () => {
    setStep(1);
    setSubmitted(false);
    setSubmittedData(null);
  };

  const stepStatus = (s: number): "done" | "active" | "idle" => {
    if (s < step) return "done";
    if (s === step) return "active";
    return "idle";
  };

  const stepLabelColor = (s: number): string =>
    s < step ? "var(--gold-dark)" : s === step ? "var(--gold-mid)" : "var(--text-muted)";

  return (
    <>
    {showNotification && 
    <Alert title="Campaign launched" message={`The campaign "${submittedData?.campaignName}" has been launched successfully.`} />
    }

      <style>{styles}</style>
      <div className="mcf-wrap">
        <div className="mcf-shimmer-bar" />
        <div className="mcf-corner mcf-corner-tl" />
        <div className="mcf-corner mcf-corner-br" />

        {submitted ? (
          <div className="mcf-success">
            <div className="mcf-success-icon">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path d="M6 15.5L12.5 22L24 9" stroke="#2a1f00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mcf-success-title">Campaign launched</h2>
            <div className="mcf-divider" />
            <p className="mcf-success-sub">
              <strong style={{ color: "var(--gold-dark)" }}>{submittedData?.campaignName}</strong> via{" "}
              {submittedData?.channel} is live and ready to perform.
            </p>
            <button type="button" className="mcf-btn-next" onClick={handleCreateAnother}>
              + Create another
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mcf-header">
              <p className="mcf-eyebrow">Marketing suite</p>
              <h1 className="mcf-title">New Campaign</h1>
              <p className="mcf-subtitle">Configure your campaign in three steps</p>
            </div>

            {/* Step indicators */}
            <div className="mcf-steps">
              {[
                { n: 1, label: "Basic info" },
                { n: 2, label: "Budget & time" },
                { n: 3, label: "Goals & review" },
              ].map(({ n, label }, i) => (
                <React.Fragment key={n}>
                  <div className="mcf-step-item">
                    <div className={`mcf-step-circle ${stepStatus(n)}`}>
                      {n < step ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7L5.5 10L11.5 4" stroke="var(--gold-mid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : n}
                    </div>
                    <span className="mcf-step-label" style={{ color: stepLabelColor(n) }}>{label}</span>
                  </div>
                  {i < 2 && (
                    <div className="mcf-step-line">
                      <div className="mcf-step-line-fill" style={{ width: step > n ? "100%" : "0%" }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Step 1 */}
              {step === 1 && (
                <div className="mcf-panel">
                  <div className="mcf-field">
                    <label className="mcf-label">Campaign name</label>
                    <input
                      className={`mcf-input${errors.campaignName ? " error" : ""}`}
                      placeholder="e.g. Black Friday Sale 2026"
                      {...register("campaignName", { required: "Campaign name is required" })}
                    />
                    {errors.campaignName && <p className="mcf-error-msg">{errors.campaignName.message}</p>}
                  </div>
                  <div className="mcf-field">
                    <label className="mcf-label">Marketing channel</label>
                    <select
                      className={`mcf-select${errors.channel ? " error" : ""}`}
                      {...register("channel", { required: "Please select a channel" })}
                    >
                      <option value="">Select a channel</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="SEO Blog">SEO Blog</option>
                    </select>
                    {errors.channel && <p className="mcf-error-msg">{errors.channel.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="mcf-panel">
                  <div className="mcf-field">
                    <div className="mcf-grid-2">
                      <div>
                        <label className="mcf-label">Start date</label>
                        <input
                          type="date"
                          className={`mcf-input${errors.startDate ? " error" : ""}`}
                          {...register("startDate", { required: "Required" })}
                        />
                        {errors.startDate && <p className="mcf-error-msg">{errors.startDate.message}</p>}
                      </div>
                      <div>
                        <label className="mcf-label">End date</label>
                        <input
                          type="date"
                          className={`mcf-input${errors.endDate ? " error" : ""}`}
                          {...register("endDate", {
                            required: "Required",
                            validate: (endDate) => {
                              const startDate = getValues("startDate");

                              if (!startDate || !endDate) return true;

                              return endDate >= startDate || "Please check the date";
                            },
                          })}
                        />
                        {errors.endDate && <p className="mcf-error-msg">{errors.endDate.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="mcf-field">
                    <label className="mcf-label">Total budget</label>
                    <div className="mcf-input-wrap">
                      <span className="mcf-prefix">$</span>
                      <input
                        type="number"
                        placeholder="1500"
                        className={`mcf-input has-prefix${errors.totalBudget ? " error" : ""}`}
                        {...register("totalBudget", {
                          required: "Budget is required",
                          valueAsNumber: true,
                          min: { value: 1, message: "Must be greater than 0" },
                        })}
                      />
                    </div>
                    {errors.totalBudget && <p className="mcf-error-msg">{errors.totalBudget.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="mcf-panel">
                  <div className="mcf-field">
                    <label className="mcf-label">Target leads</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      className={`mcf-input${errors.targetLeads ? " error" : ""}`}
                      {...register("targetLeads", {
                        required: "Target leads is required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Must target at least 1 lead" },
                      })}
                    />
                    {errors.targetLeads && <p className="mcf-error-msg">{errors.targetLeads.message}</p>}
                  </div>

                  <div className="mcf-review">
                    <div className="mcf-review-header">
                      <div className="mcf-review-dot" />
                      <span className="mcf-review-title">Campaign summary</span>
                    </div>
                    <div className="mcf-review-row">
                      <span className="mcf-review-key">Campaign name</span>
                      <span className="mcf-review-val">{values?.campaignName || "—"}</span>
                    </div>
                    <div className="mcf-review-row">
                      <span className="mcf-review-key">Channel</span>
                      <span className="mcf-review-val">{values?.channel || "—"}</span>
                    </div>
                    <div className="mcf-review-row">
                      <span className="mcf-review-key">Duration</span>
                      <span className="mcf-review-val">
                        {values?.startDate && values?.endDate ? `${values.startDate} → ${values.endDate}` : "—"}
                      </span>
                    </div>
                    <div className="mcf-review-row">
                      <span className="mcf-review-key">Budget</span>
                      <span className="mcf-review-val gold">
                        {values?.totalBudget ? `$${Number(values.totalBudget).toLocaleString()}` : "—"}
                      </span>
                    </div>
                    <div className="mcf-review-row">
                      <span className="mcf-review-key">Per day cost</span>
                      <span className="mcf-review-val gold">
                        {perDayCost !== null ? `$${perDayCost.toFixed(2)}` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mcf-actions">
                <button type="button" className="mcf-btn-back" disabled={step === 1} onClick={prevStep}>
                  ← Back
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div className="mcf-dots">
                    {[1, 2, 3].map((d) => (
                      <div key={d} className={`mcf-dot ${d === step ? "active" : "inactive"}`} />
                    ))}
                  </div>
                  {step < 3 ? (
                    <button type="button" className="mcf-btn-next" onClick={nextStep}>
                      Next step <span style={{ fontSize: 16 }}>→</span>
                    </button>
                  ) : (
                    <button type="submit" className="mcf-btn-next">
                      Launch campaign <span style={{ fontSize: 14 }}>✦</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default MarketingCreateCampaign;