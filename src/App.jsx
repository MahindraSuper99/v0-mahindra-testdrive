import { useState, useMemo } from 'react';
import { ResponsesBoard } from '@api/BoardSDK.js';
import { Card, CardContent, CardHeader, CardTitle, Button, Checkbox, Label } from './components/ui-mock';
import ProgressStepper from './components/ProgressStepper';
import RatingButtons from './components/RatingButtons';
import ReasonSelector from './components/ReasonSelector';
import FeedbackTextarea from './components/FeedbackTextarea';
import { CheckCircle2, AlertCircle, Shield, FileText, Clock } from 'lucide-react';
import { sanitizeInput } from './utils/helpers';

const responsesBoard = new ResponsesBoard();

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [popiaConsent, setPopiaConsent] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Q1: Vehicle Performance Satisfaction (1-5)
  const [vehicleSatisfaction, setVehicleSatisfaction] = useState(null);
  // Q2: Overall Test Drive OSAT (1-5)
  const [overallExperience, setOverallExperience] = useState(null);
  // Dissatisfaction reasons (only shown if OSAT is Poor/Unacceptable)
  const [dissatisfactionReason, setDissatisfactionReason] = useState([]);
  // Q4: Additional Feedback
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [feedbackConsent, setFeedbackConsent] = useState(false);

  const surveyId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
  }, []);

  const dealerName = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('dealer') || null;
  }, []);

  const isExpired = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const expires = params.get('expires');
    if (!expires) return false;
    const expiryDate = new Date(expires);
    expiryDate.setHours(23, 59, 59, 999);
    return new Date() > expiryDate;
  }, []);

  const hasLowRating = () => {
    const lowVehicleSat = vehicleSatisfaction === 'Dissatisfied' || vehicleSatisfaction === 'Very Dissatisfied';
    const lowOSAT = overallExperience === 'Poor' || overallExperience === 'Unacceptable';
    return lowVehicleSat || lowOSAT;
  };

  const needsReasonStep = overallExperience === 'Poor' || overallExperience === 'Unacceptable';
  const totalSteps = needsReasonStep ? 4 : 3;

  const vehicleSatOptions = [
    { label: 'Very Satisfied', color: 'bg-[#00c875]' },
    { label: 'Satisfied', color: 'bg-[#9cd326]' },
    { label: 'Neutral', color: 'bg-[#fdab3d]' },
    { label: 'Dissatisfied', color: 'bg-[#ff7b5c]' },
    { label: 'Very Dissatisfied', color: 'bg-[#e2445c]' },
  ];

  const osatOptions = [
    { label: 'Excellent', color: 'bg-[#00c875]' },
    { label: 'Good', color: 'bg-[#9cd326]' },
    { label: 'Fair', color: 'bg-[#fdab3d]' },
    { label: 'Poor', color: 'bg-[#ff7b5c]' },
    { label: 'Unacceptable', color: 'bg-[#e2445c]' },
  ];

  const reasonOptions = [
    'Route was not suitable for the vehicle',
    'Sales Consultant was not knowledgeable about the vehicle',
    'Insufficient time given for the test drive',
    'Vehicle was not clean or well-presented',
    'The Sales Executive / Consultant did not explain vehicle features before the drive',
    'The Sales Executive / Consultant was not present during the test drive',
    'Vehicle had a technical issue during the test drive',
    'The Sales Executive / Consultant Amenities not satisfactory',
    'Other',
  ];

  const canProceed = () => {
    if (currentStep === 1) return vehicleSatisfaction !== null;
    if (currentStep === 2) return overallExperience !== null;
    if (currentStep === 3 && needsReasonStep) return true;
    return true;
  };

  const handleStartSurvey = () => {
    if (!popiaConsent) {
      setValidationError('Please accept the privacy notice to continue');
      return;
    }
    setValidationError('');
    setShowWelcome(false);
  };

  const handleNext = () => {
    if (!canProceed()) return;
    setValidationError('');
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!feedbackConsent) {
      setValidationError('Please consent to data usage before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      const now = new Date();
      const submissionData = {
        name: `Test Drive Survey Response - ${now.toLocaleDateString()}`,
        surveyId: surveyId,
        dealer: dealerName,
        submittedDate: now.toISOString(),
        responseType: 'Test Drive Feedback',
        reviewStatus: 'New',
        vehicleSatisfaction: vehicleSatisfaction,
        overallExperience: overallExperience,
        dissatisfactionReasons: dissatisfactionReason.length > 0 ? dissatisfactionReason : null,
        hasLowRating: hasLowRating(),
        notes: sanitizeInput(additionalFeedback),
        popiaConsent: popiaConsent,
        feedbackConsent: feedbackConsent,
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      setValidationError('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    if (currentStep === 1) return `How satisfied were you with the vehicle's performance, comfort, and features during the test drive${dealerName ? ` at ${dealerName}` : ''}?`;
    if (currentStep === 2) return 'How would you rate your overall Test Drive Experience?';
    if (currentStep === 3 && needsReasonStep) return 'Please select the primary reason(s) for your dissatisfaction';
    return 'Would you like to share any additional feedback about your test drive?';
  };

  const getStepDescription = () => {
    if (currentStep === 1) return 'Rate your experience with the Mahindra vehicle during your test drive';
    if (currentStep === 2) return 'Rate your overall test drive experience at the dealership';
    if (currentStep === 3 && needsReasonStep) return 'You may select more than one reason';
    return 'Optional - Share any additional comments about your test drive';
  };

  const Header = () => (
    <header className="bg-gradient-to-r from-[#E31837] to-[#b81226] text-white py-3 sm:py-4 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-center sm:justify-start">
        <div className="flex items-center gap-3">
          <img src="/mahindra-logo.webp" alt="Mahindra" className="h-8 sm:h-10 w-auto" />
        </div>
      </div>
    </header>
  );

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] safe-area-bottom">
        <Header />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
          <Card className="max-w-md w-full text-center p-6 sm:p-8 bg-white">
            <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-[#E31837] mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[#1a1a1a]">Survey Link Expired</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              This survey link is no longer active.
            </p>
            <p className="text-xs text-gray-500">
              Survey links are valid for 7 days from the date they are issued.
              Please contact your Mahindra dealer if you require a new link.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] safe-area-bottom">
        <Header />
        <div className="py-6 sm:py-10 px-4 sm:px-6 max-w-2xl mx-auto">
          <Card className="bg-[#222222] shadow-xl border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <img src="/mahindra-logo.webp" alt="Mahindra" className="h-12 sm:h-16 w-auto mx-auto mb-4" />
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Test Drive Experience Survey
                </h1>
                <p className="text-xs sm:text-sm text-[#E31837] font-medium mb-2">Mahindra South Africa</p>
                <p className="text-sm sm:text-base text-white/70">
                  Thank you for test driving a Mahindra. Your feedback helps us improve our vehicles and services.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Clock className="w-5 h-5 text-[#E31837] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/50">Duration</p>
                    <p className="text-sm font-medium text-white">2-3 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <FileText className="w-5 h-5 text-[#E31837] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/50">Questions</p>
                    <p className="text-sm font-medium text-white">3 questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Shield className="w-5 h-5 text-[#E31837] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/50">Valid for</p>
                    <p className="text-sm font-medium text-white">7 days</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-5 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="w-5 h-5 text-[#E31837] flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Privacy Notice (POPIA Compliance)
                  </h3>
                </div>
                <div className="text-xs sm:text-sm text-white/60 space-y-3 ml-8">
                  <p>
                    In accordance with the <strong className="text-white/80">Protection of Personal Information Act (POPIA)</strong>,
                    we are committed to protecting your personal information and your right to privacy.
                  </p>
                  <p><strong className="text-white/80">What we collect:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Your satisfaction ratings and feedback responses</li>
                    <li>Survey completion timestamp</li>
                    <li>Device and browser information for survey functionality</li>
                  </ul>
                  <p><strong className="text-white/80">How we use your information:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>To improve our vehicles, products and services</li>
                    <li>To address any concerns or issues raised in your feedback</li>
                    <li>To generate anonymised statistical reports</li>
                    <li>To follow up on low satisfaction ratings (CCCF process)</li>
                  </ul>
                  <p><strong className="text-white/80">Your rights:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>You may request access to your personal information</li>
                    <li>You may request correction or deletion of your information</li>
                    <li>You may withdraw consent at any time by contacting us</li>
                  </ul>
                  <p className="text-[10px] sm:text-xs text-white/40 mt-2">
                    For queries about your personal information, contact Mahindra South Africa at{' '}
                    <a href="mailto:privacy@mahindra.co.za" className="text-[#E31837] underline">privacy@mahindra.co.za</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#E31837]/10 border border-[#E31837]/30 rounded-lg mb-6">
                <Checkbox
                  id="popia-consent"
                  checked={popiaConsent}
                  onCheckedChange={setPopiaConsent}
                  className="mt-0.5 h-5 w-5 border-[#E31837] data-[state=checked]:bg-[#E31837]"
                />
                <Label htmlFor="popia-consent" className="text-xs sm:text-sm text-white/80 cursor-pointer leading-relaxed">
                  <strong className="text-white">Required:</strong> I have read and understand the Privacy Notice. I consent to Mahindra South Africa
                  collecting, processing, and storing my feedback in accordance with POPIA for the purposes described above.
                </Label>
              </div>

              {validationError && (
                <div className="mb-4 p-3 bg-[#E31837]/10 border border-[#E31837]/30 text-[#E31837] rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{validationError}</p>
                </div>
              )}

              <Button
                onClick={handleStartSurvey}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-[#E31837] hover:bg-[#c41530] text-white"
              >
                Start Survey
              </Button>

              <p className="text-center text-[10px] sm:text-xs text-white/30 mt-4">
                By proceeding, you confirm that you recently completed a Mahindra test drive.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="py-4 text-center">
          <p className="text-white/40 text-[10px] sm:text-xs">
            &copy; {new Date().getFullYear()} Mahindra South Africa. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] safe-area-bottom">
        <Header />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
          <Card className="max-w-md w-full text-center p-6 sm:p-8 bg-white">
            <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-[#00c875] mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[#1a1a1a]">Thank you for your feedback!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2">Your responses have been recorded securely.</p>
            <p className="text-xs text-gray-500">
              Your personal information is protected in accordance with POPIA.
              {hasLowRating() && ' A customer care representative may contact you to address your concerns.'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] safe-area-bottom">
      <Header />
      <div className="py-4 sm:py-6 px-3 sm:px-4 max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <p className="text-white/80 text-xs sm:text-sm">Test Drive Experience Survey</p>
        </div>

        <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />

        <Card className="mt-4 sm:mt-6 bg-white shadow-lg">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
            <CardTitle className="text-base sm:text-lg leading-snug text-[#1a1a1a]">
              {getStepTitle()}
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{getStepDescription()}</p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
            {currentStep === 1 && <RatingButtons options={vehicleSatOptions} selected={vehicleSatisfaction} onChange={setVehicleSatisfaction} />}
            {currentStep === 2 && <RatingButtons options={osatOptions} selected={overallExperience} onChange={setOverallExperience} />}
            {currentStep === 3 && needsReasonStep && <ReasonSelector options={reasonOptions} selected={dissatisfactionReason} onChange={setDissatisfactionReason} />}
            {((currentStep === 3 && !needsReasonStep) || (currentStep === 4 && needsReasonStep)) && (
              <FeedbackTextarea
                value={additionalFeedback}
                onChange={setAdditionalFeedback}
                consent={feedbackConsent}
                onConsentChange={setFeedbackConsent}
                isRequired={false}
              />
            )}

            {validationError && (
              <div className="mt-4 p-3 bg-red-50 text-[#E31837] rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{validationError}</p>
              </div>
            )}

            <div className="flex justify-between mt-6 sm:mt-8 pt-4 border-t border-gray-100 gap-3">
              <Button
                variant="outline"
                onClick={currentStep > 1 ? handleBack : undefined}
                className="flex-1 sm:flex-none h-12 sm:h-11 text-base sm:text-sm border-2 border-[#E31837] text-[#E31837] hover:bg-[#E31837]/10 !opacity-100"
              >
                Back
              </Button>
              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none h-12 sm:h-11 text-base sm:text-sm bg-[#E31837] hover:bg-[#c41530] text-white !opacity-100"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none h-12 sm:h-11 text-base sm:text-sm bg-[#E31837] hover:bg-[#c41530] text-white !opacity-100"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-[10px] sm:text-xs">
            Survey link valid for 7 days | Your data is protected under POPIA
          </p>
        </div>
      </div>
    </div>
  );
}
