interface Props {
  step: number;
  steps: string[];
}

export default function UploadStepper({ step, steps }: Props) {
  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${(step / (steps.length - 1)) * 100}%`,
            backgroundColor: "#b98b08",
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((label, i) => {
          const isComplete = i < step;
          const isCurrent = i === step;

          return (
            <div key={label} className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`
                  relative z-10 h-9 w-9 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all duration-300
                  ${
                    isComplete
                      ? "text-white shadow-lg"
                      : isCurrent
                        ? "text-white ring-4 shadow-lg"
                        : "bg-white text-gray-400 border-2 border-gray-200"
                  }
                `}
                style={
                  isComplete || isCurrent
                    ? {
                        backgroundColor: "#b98b08",
                        ...(isCurrent && {
                          ringColor: "rgba(185, 139, 8, 0.2)",
                        }),
                      }
                    : undefined
                }
              >
                {isComplete ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  mt-2.5 text-xs font-medium transition-colors duration-200 whitespace-nowrap
                  ${
                    isCurrent
                      ? "text-gray-900 font-semibold"
                      : isComplete
                        ? "text-gray-600"
                        : "text-gray-400"
                  }
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
