import { Upload, Save, ChevronRight, ChevronLeft, Type, CheckSquare, ZoomIn, ZoomOut, Undo, Redo, Circle, ChevronDown, Settings, Download, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToolMode } from '@/types/fields';

interface TopToolbarProps {
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  activeTool: ToolMode;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onToolChange: (tool: ToolMode) => void;
  onUpload: () => void;
  onSave: () => void;
  onSettings: () => void;
  hasDocument: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSaveFields?: () => void;
  onLoadFields?: () => void;
  hasFields?: boolean;
}

export const TopToolbar = ({
  currentPage,
  totalPages,
  zoomLevel,
  activeTool,
  onPageChange,
  onZoomChange,
  onToolChange,
  onUpload,
  onSave,
  onSettings,
  hasDocument,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSaveFields,
  onLoadFields,
  hasFields = false,
}: TopToolbarProps) => {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoomLevel + 10, 200));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoomLevel - 10, 50));
  };

  return (
    <div className="w-full h-14 bg-toolbar-bg border-b border-border flex items-center px-4 gap-4" dir="ltr">
      {/* File operations - left side */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onUpload}>
          <Upload className="w-4 h-4 mr-2" />
          העלה PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={!hasDocument}
        >
          <Save className="w-4 h-4 mr-2" />
          שמור PDF מלא
        </Button>
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="w-4 h-4 mr-2" />
          הגדרות
        </Button>
      </div>

      {hasDocument && (
        <>
          <Separator orientation="vertical" className="h-8" />

          {/* Field template operations */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveFields}
              disabled={!hasFields}
              title="שמור שדות כתבנית"
            >
              <Download className="w-4 h-4 mr-2" />
              שמור שדות
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadFields}
              title="טען שדות מתבנית"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              טען שדות
            </Button>
          </div>
        </>
      )}

      {hasDocument && (
        <>
          <Separator orientation="vertical" className="h-8" />

          {/* Navigation - center */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              title="עמוד קודם"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-[100px] text-center">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              title="עמוד הבא"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Field tools - center/right */}
          <div className="flex gap-2">
            <Button
              variant={activeTool === 'text-field' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('text-field')}
              title="הוסף שדה טקסט"
            >
              <Type className="w-4 h-4 mr-2" />
              שדה טקסט
            </Button>
            <Button
              variant={activeTool === 'checkbox-field' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('checkbox-field')}
              title="הוסף תיבת סימון"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              תיבת סימון
            </Button>
            <Button
              variant={activeTool === 'radio-field' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('radio-field')}
              title="הוסף כפתור רדיו"
            >
              <Circle className="w-4 h-4 mr-2" />
              כפתור רדיו
            </Button>
            <Button
              variant={activeTool === 'dropdown-field' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('dropdown-field')}
              title="הוסף רשימה נפתחת"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              רשימה נפתחת
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Undo/Redo - center */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              title="בטל (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              title="בצע שוב (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1" /> {/* Spacer */}

          {/* Zoom controls - right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              title="הקטן"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-12 text-center">{zoomLevel}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              title="הגדל"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
