import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsCardProps {
  variableCount: number;
  formType: string;
  onVariableCountChange: (count: number) => void;
  onFormTypeChange: (type: string) => void;
  onSetAllCells: (value: number | string) => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  variableCount,
  formType,
  onVariableCountChange,
  onFormTypeChange,
  onSetAllCells,
}) => {
  return (
    <Card className="w-full max-w-md border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Karnaugh Map Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Variable Count Selection (Tabs) */}
        <div className="space-y-3" data-tour="variable-count">
          <p className="text-sm font-medium text-muted-foreground">Choose number of variables:</p>
          <Tabs value={String(variableCount)} onValueChange={(val) => onVariableCountChange(Number(val))}>
            <TabsList className='w-full'>
              {['2', '3', '4', '5'].map((v) => (
                <TabsTrigger key={v} value={v} className="px-3 py-1">
                  {v}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Form Type Selection (Tabs) */}
        <div className="space-y-3" data-tour="form-type">
          <p className="text-sm font-medium text-muted-foreground">Form: {formType}</p>
          <Tabs value={formType} onValueChange={(val) => onFormTypeChange(val)}>
            <TabsList className='w-full'>
              {['SOP', 'POS'].map((type) => (
                <TabsTrigger key={type} value={type} className="px-3 py-1">
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Set All Cells */}
        <div className="space-y-3" data-tour="set-all">
          <p className="text-sm font-medium text-muted-foreground">Set all cells to:</p>
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
      </CardContent>
    </Card>
  )
}

export default SettingsCard;