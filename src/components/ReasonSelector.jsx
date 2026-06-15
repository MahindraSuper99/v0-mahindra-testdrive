import { cn } from '@lib/utils';
import { CheckSquare, Square } from 'lucide-react';

export default function ReasonSelector({ options, selected = [], onChange, otherText = '', onOtherTextChange }) {
  const toggle = (reason) => {
    if (selected.includes(reason)) {
      onChange(selected.filter((r) => r !== reason));
    } else {
      onChange([...selected, reason]);
    }
  };

  const hasOther = selected.includes('Other');

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <p className="text-xs sm:text-sm text-red-800">
          <strong>Required:</strong> Please select at least one reason for your dissatisfaction.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {options.map((reason) => {
          const isSelected = selected.includes(reason);
          return (
            <button
              key={reason}
              type="button"
              onClick={() => toggle(reason)}
              className={cn(
                'p-4 rounded-lg text-left text-sm font-medium border-2 transition-all active:scale-[0.99] flex items-start gap-3',
                isSelected
                  ? 'bg-[#E31837]/5 text-[#1a1a1a] border-[#E31837] shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              )}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-[#E31837] flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{reason}</span>
            </button>
          );
        })}
      </div>

      {hasOther && (
        <div className="pt-2">
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Please specify <span className="text-[#E31837]">*</span>
          </label>
          <textarea
            value={otherText}
            onChange={(e) => onOtherTextChange(e.target.value)}
            placeholder="Tell us more about your experience..."
            rows={3}
            className="w-full rounded-lg border-2 border-gray-200 p-3 text-sm text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#E31837] resize-none"
          />
        </div>
      )}

      {selected.length > 0 && (
        <div className="text-center pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {selected.length} reason{selected.length > 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
