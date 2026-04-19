import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

const Alert = ({ 
  title, 
  message, 
  onClose,
  duration = 3000 // default 3 sec
}: { 
  title: string; 
  message: string; 
  onClose?: () => void;
  duration?: number;
}) => {

  // 🔥 Auto close logic inside component
  useEffect(() => {
    if (!onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-50 min-w-[280px] max-w-[320px] animate-in fade-in slide-in-from-bottom-5 duration-400 ease-out">
      
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex items-start gap-3.5 p-4 pr-8">
        
        <div className="bg-emerald-50 p-1.5 rounded-full shrink-0 mt-0.5 border border-emerald-100/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        
        <div className="flex flex-col flex-1">
          <span className="text-sm font-semibold tracking-tight text-slate-950">
            {title}
          </span>
          <span className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {message}
          </span>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
      </div>
    </div>
  );
};

export default Alert;