import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface SettingsCardProps {
  variableCount: number;
  formType: string;
  onVariableCountChange: (count: number) => void;
  onFormTypeChange: (type: string) => void;
  onSetAllCells: (value: number | string) => void;
  onProcess: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  variableCount,
  formType,
  onVariableCountChange,
  onFormTypeChange,
  onSetAllCells,
  onProcess
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Karnaugh Map Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Variable Count Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Choose number of variables:</p>
          <div className="flex gap-2">
            {[2, 3, 4].map((count) => (
              <Button
                key={count}
                variant={variableCount === count ? "default" : "outline"}
                size="sm"
                onClick={() => onVariableCountChange(count)}
                className="flex-1"
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* Form Type Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Form: {formType}</p>
          <div className="flex gap-2">
            {['SOP', 'POS'].map((type) => (
              <Button
                key={type}
                variant={formType === type ? "default" : "outline"}
                size="sm"
                onClick={() => onFormTypeChange(type)}
                className="flex-1"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Set All Cells */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Set all cells to:</p>
          <div className="flex gap-2">
            {[0, 1, 'X'].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => onSetAllCells(value)}
                className="flex-1"
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        {/* Process Button */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Get the result:</p>
          <Button 
            onClick={onProcess}
            className="w-full"
            size="lg"
          >
            Process
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SettingsCard;