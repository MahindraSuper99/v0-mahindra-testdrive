import { Textarea, Checkbox, Label } from './ui-mock';

export default function FeedbackTextarea({ value, onChange, consent, onConsentChange, isRequired = false, wantsToComment, onWantsToCommentChange }) {
  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Yes / No question */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#1a1a1a]">
          Would you like to leave a comment? <span className="font-normal text-gray-500">(optional)</span>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onWantsToCommentChange(true)}
            className={`flex-1 h-11 rounded-lg border-2 text-sm font-semibold transition-all ${
              wantsToComment === true
                ? 'bg-[#E31837] border-[#E31837] text-white'
                : 'border-gray-200 text-gray-700 hover:border-[#E31837] hover:text-[#E31837]'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => { onWantsToCommentChange(false); onChange(''); }}
            className={`flex-1 h-11 rounded-lg border-2 text-sm font-semibold transition-all ${
              wantsToComment === false
                ? 'bg-[#E31837] border-[#E31837] text-white'
                : 'border-gray-200 text-gray-700 hover:border-[#E31837] hover:text-[#E31837]'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Comment block — only shown when Yes is selected */}
      {wantsToComment === true && (
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-xs font-medium text-gray-600">
            Your comment <span className="text-[#E31837]">*</span>
          </label>
          <Textarea
            id="feedback"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Share your thoughts with us..."
            className="min-h-[120px] sm:min-h-[140px] text-base border-gray-200 focus:border-[#E31837] focus:ring-[#E31837]"
          />
          {!value.trim() && (
            <p className="text-xs text-[#E31837]">Please enter your comment to continue.</p>
          )}
        </div>
      )}

      {/* Consent checkbox */}
      <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={onConsentChange}
          className="mt-0.5 h-5 w-5 border-gray-300 data-[state=checked]:bg-[#E31837] data-[state=checked]:border-[#E31837]"
        />
        <Label htmlFor="consent" className="text-xs sm:text-sm font-normal cursor-pointer leading-relaxed text-gray-700">
          <span className="text-[#E31837] font-medium">Required:</span> I consent to Mahindra South Africa processing my feedback in accordance with POPIA. I understand this may include follow-up contact if I have indicated dissatisfaction, and my responses may be used to improve products and services.
        </Label>
      </div>
    </div>
  );
}
