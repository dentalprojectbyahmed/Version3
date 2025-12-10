import { useState } from 'react';

export default function DentalChart({ onToothSelect, selectedTeeth = [], mode = 'adult' }) {
  const [hoveredTooth, setHoveredTooth] = useState(null);

  const adultTeeth = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
    lowerRight: [48, 47, 46, 45, 44, 43, 42, 41]
  };

  const primaryTeeth = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerLeft: [71, 72, 73, 74, 75],
    lowerRight: [85, 84, 83, 82, 81]
  };

  const teeth = mode === 'adult' ? adultTeeth : primaryTeeth;

  const isSelected = (tooth) => selectedTeeth.includes(tooth);

  const handleToothClick = (tooth) => {
    if (onToothSelect) {
      onToothSelect(tooth);
    }
  };

  const ToothButton = ({ tooth }) => (
    <button
      type="button"
      onClick={() => handleToothClick(tooth)}
      onMouseEnter={() => setHoveredTooth(tooth)}
      onMouseLeave={() => setHoveredTooth(null)}
      className={`
        w-10 h-12 border-2 rounded-lg flex items-center justify-center text-xs font-bold
        transition-all duration-150
        ${isSelected(tooth) 
          ? 'bg-primary-600 text-white border-primary-700 shadow-md' 
          : 'bg-card text-foreground border-border hover:border-primary-400 hover:bg-primary-50'
        }
        ${hoveredTooth === tooth ? 'scale-110 shadow-lg z-10' : ''}
      `}
    >
      {tooth}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex space-x-2 mb-2">
          <button
            type="button"
            onClick={() => {}}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'adult' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-foreground'}`}
          >
            Adult (11-48)
          </button>
          <button
            type="button"
            onClick={() => {}}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'primary' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-foreground'}`}
          >
            Primary (51-85)
          </button>
        </div>
      </div>

      <div className="bg-background rounded-lg p-6">
        {/* Upper arch */}
        <div className="mb-8">
          <div className="text-xs text-muted-foreground text-center mb-2">Upper Arch</div>
          <div className="flex justify-center space-x-8">
            {/* Upper Right */}
            <div className="flex space-x-1">
              {teeth.upperRight.map(tooth => (
                <ToothButton key={tooth} tooth={tooth} />
              ))}
            </div>
            
            {/* Midline */}
            <div className="w-px bg-red-400"></div>
            
            {/* Upper Left */}
            <div className="flex space-x-1">
              {teeth.upperLeft.map(tooth => (
                <ToothButton key={tooth} tooth={tooth} />
              ))}
            </div>
          </div>
        </div>

        {/* Lower arch */}
        <div>
          <div className="text-xs text-muted-foreground text-center mb-2">Lower Arch</div>
          <div className="flex justify-center space-x-8">
            {/* Lower Right */}
            <div className="flex space-x-1">
              {teeth.lowerRight.map(tooth => (
                <ToothButton key={tooth} tooth={tooth} />
              ))}
            </div>
            
            {/* Midline */}
            <div className="w-px bg-red-400"></div>
            
            {/* Lower Left */}
            <div className="flex space-x-1">
              {teeth.lowerLeft.map(tooth => (
                <ToothButton key={tooth} tooth={tooth} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedTeeth.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="text-sm font-medium text-primary-900">
            Selected: {selectedTeeth.join(', ')}
          </div>
        </div>
      )}

      {hoveredTooth && (
        <div className="text-center text-sm text-muted-foreground">
          Tooth: {hoveredTooth}
        </div>
      )}
    </div>
  );
}
