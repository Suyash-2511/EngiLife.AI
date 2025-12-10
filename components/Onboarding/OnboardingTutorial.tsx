import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Briefcase, ChevronRight, X, Sparkles } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to EngiLife",
      subtitle: "Your Integrated Engineering Ecosystem",
      description: "Streamline your entire student lifecycle—from academic problem-solving to career placement—in one intelligent platform.",
      icon: <Sparkles size={48} className="text-blue-600" />,
      bg: "bg-blue-50"
    },
    {
      title: "Academic Enablement",
      subtitle: "Master the Curriculum",
      description: "Access dynamic study planners, AI-driven concept clarification, and automated lab manual generation tailored to your branch.",
      icon: <BookOpen size={48} className="text-indigo-600" />,
      bg: "bg-indigo-50"
    },
    {
      title: "Life Management",
      subtitle: "Balance the Grind",
      description: "Optimize your daily operations with wellness guidance, expense tracking, and hostel utility management.",
      icon: <Heart size={48} className="text-rose-600" />,
      bg: "bg-rose-50"
    },
    {
      title: "Career Acceleration",
      subtitle: "Future-Proof Your Skills",
      description: "Prepare for placements with our resume builder, mock interview tools, and industry-aligned skill pathing.",
      icon: <Briefcase size={48} className="text-emerald-600" />,
      bg: "bg-emerald-50"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Visual Header */}
        <div className={`h-48 ${steps[step].bg} flex items-center justify-center transition-colors duration-500`}>
          <div className="bg-white p-6 rounded-full shadow-sm shadow-indigo-100 transform transition-transform duration-500 hover:scale-110">
            {steps[step].icon}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 text-center flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{steps[step].title}</h2>
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{steps[step].subtitle}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {steps[step].description}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'
                  }`} 
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium shadow-lg shadow-gray-200 hover:shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group"
            >
              {step === steps.length - 1 ? "Get Started" : "Continue"}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
