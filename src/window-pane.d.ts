import Widget from 'kenga/widget';
import WindowEvent from './events/window-event';

export default class WindowPane {
  constructor(aView: Widget, formKey: any);

  formKey: any;
  defaultCloseOperation: number;
  icon: string | HTMLElement;
  title: string;
  element: HTMLElement;
  modalMask: HTMLElement;
  resizable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  closable: boolean;
  minimized: boolean;
  maximized: boolean;
  undecorated: boolean;
  alwaysOnTop: boolean;
  locationByPlatform: boolean;
  showAtCenter: boolean;
  autoClose: boolean;
  opacity: number;

  activate(): void;
  deactivate(): void;
  show(): void;
  showModal(onSelect?: (selected: any) => void): void;
  showInternalFrame(desktopPane: Widget): void;
  close(selected?: any): void;
  minimize(): void;
  maximize(): void;
  restore(): void;
  toFront(): void;
  shown(): Widget[];

  addWindowOpenedHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  onWindowOpened: (evt: WindowEvent) => void;

  addWindowClosingHandler(handler: (evt: WindowEvent) => boolean): { removeHandler: () => void };
  onWindowClosing: (evt: WindowEvent) => boolean;

  addWindowClosedHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  onWindowClosed: (evt: WindowEvent) => void;

  addWindowMinimizedHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  onWindowMinimized: (evt: WindowEvent) => void;

  addWindowRestoredHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  onWindowRestored: (evt: WindowEvent) => void;

  addWindowMaximizedHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  onWindowMaximized: (evt: WindowEvent) => void;

  addWindowActivatedHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  onWindowActivated: (evt: WindowEvent) => void;

  addWindowDeactivatedHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  onWindowDeactivated: (evt: WindowEvent) => void;

  static addShownChangeHandler(handler: (evt: WindowEvent) => void): { removeHandler: () => void };
  static onChange: (evt: WindowEvent) => void;
}
