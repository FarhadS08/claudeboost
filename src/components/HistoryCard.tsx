import { useState } from "react";
import { HistoryEntry } from "@/lib/data";
import DomainBadge from "./DomainBadge";
import StarRating from "./StarRating";
import { ChevronDown } from "lucide-react";

interface HistoryCardProps {
  entry: HistoryEntry;
  index: number;
  onUpdate: (id: number, updates: Partial<HistoryEntry>) => void;
}

const HistoryCard = ({ entry, index, onUpdate }: HistoryCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(entry.feedback);
  const [rating, setRating] = useState(entry.rating);
  const [saved, setSaved] = useState(false);

  const date = new Date(entry.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const truncated =
    entry.original.length > 80
      ? entry.original.slice(0, 80) + "..."
      : entry.original;

  const handleSave = () => {
    onUpdate(entry.id, { rating, feedback });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div
      className="border border-border bg-card rounded-lg overflow-hidden transition-shadow hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)] animate-fade-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <DomainBadge domain={entry.domain} />
        <span className="flex-1 text-sm text-muted-foreground truncate font-body">
          {truncated}
        </span>
        {entry.rating && (
          <span className="text-warning text-sm flex-shrink-0">
            {"★".repeat(entry.rating)}
          </span>
        )}
        <span className="text-xs text-muted-foreground flex-shrink-0">{date}</span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded content */}
      <div
        className="transition-all duration-200 ease-in-out overflow-hidden"
        style={{ maxHeight: expanded ? "800px" : "0" }}
      >
        <div className="px-4 pb-4">
          {/* Diff panels */}
          <div className="grid grid-cols-2 gap-0 rounded-lg overflow-hidden mb-4">
            <div className="bg-code-bg p-4">
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                🔵 Original
              </div>
              <p className="font-display text-[13px] text-[#c9d1d9] leading-relaxed">
                {entry.original}
              </p>
            </div>
            <div className="bg-code-bg p-4 border-l-2 border-primary/20">
              <div className="text-xs text-domain-ds-text mb-2 uppercase tracking-wider">
                ⚡ Boosted
              </div>
              <p className="font-display text-[13px] text-[#c9d1d9] leading-relaxed">
                {entry.boosted}
              </p>
            </div>
          </div>

          {/* Feedback form */}
          <div className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
              Rate this boost
            </div>
            <StarRating rating={rating} onRate={setRating} />
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What should be different next time? e.g. always use Python, avoid verbose explanations"
              rows={3}
              className="w-full mt-3 bg-background border border-border rounded-lg p-3 font-display text-[13px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSave}
              className={`mt-3 px-4 py-2 rounded-lg font-display text-sm font-medium transition-colors ${
                saved
                  ? "bg-success/20 text-success"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {saved ? "Saved ✓" : "Save Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
