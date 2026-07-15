import type { ToolId } from '../tools';

export type ToolButton = {
  id: ToolId;
  label: string;
  shortcut: string;
  /** SVG path data for the button glyph, drawn in a 24×24 viewBox. */
  icon: string;
};

export type ToolbarIconProps = {
  /** SVG path data drawn in a 24×24 viewBox. */
  path: string;
};

export type ToolButtonProps = {
  button: ToolButton;
  isActive: boolean;
  onSelectAction: (tool: ToolId) => void;
};

export type ToolbarProps = {
  activeTool: ToolId;
  /** Current camera zoom (1 = 100%), for the readout. */
  zoom: number;
  onSelectToolAction: (tool: ToolId) => void;
  onZoomInAction: () => void;
  onZoomOutAction: () => void;
  onResetViewAction: () => void;
};
