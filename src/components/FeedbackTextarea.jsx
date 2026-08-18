import { Textarea, Checkbox, Label } from './ui-mock';

export default function FeedbackTextarea({ value, onChange, consent, onConsentChange }) {
  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Mandatory comment box */}
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
          <p className="text-xs text-[#E31837]">This field is mandatory. Please enter your comment to continue.</p>
        )}
      </div>

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
