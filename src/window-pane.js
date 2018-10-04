import Id from 'septima-utils/id';
import Invoke from 'septima-utils/invoke';
import Ui from 'kenga/utils';
import WindowEvent from './events/window-event';

const DEFAULT_WINDOWS_SPACING_X = 25;
const DEFAULT_WINDOWS_SPACING_Y = 20;

const platformLocation = {
    x: 0,
    y: 0
};
const shownForms = new Map();

function getShownForms() {
    return Array.from(shownForms.values());
}

function getShownForm(aFormKey) {
    return shownForms.get(aFormKey);
}

class WindowPane {
    constructor(aView, formKey) {
        if (arguments.length < 2)
            formKey = Id.next();
        let content;
        if (arguments.length < 1) {
            content = document.createElement('div');
            content.className = 'p-widget';
        } else {
            content = aView.element;
        }
        const self = this;
        const shell = document.createElement('div');
        shell['p-widget'] = this;
        shell.className = 'p-window-shell';
        const caption = document.createElement('div');
        caption.className = 'p-window-caption';

        function decorationOnMove(element, onMove) {
            Ui.on(element, Ui.Events.MOUSEDOWN, downEvent => {
                downEvent.stopPropagation();
                const snapshot = {
                    downPageX: downEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
                    downPageY: downEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop,
                    startLeft: shell.offsetLeft,
                    startTop: shell.offsetTop,
                    startWidth: content.offsetWidth,
                    startHeight: content.offsetHeight
                };
                const mouseMoveReg = Ui.on(document, Ui.Events.MOUSEMOVE, moveEvent => {
                    moveEvent.stopPropagation();
                    onMove(snapshot, moveEvent);
                }, true);
                const mouseUpReg = Ui.on(document, Ui.Events.MOUSEUP, upEvent => {
                    upEvent.stopPropagation();
                    mouseMoveReg.removeHandler();
                    mouseUpReg.removeHandler();
                }, true);
            });
        }

        decorationOnMove(caption, (snapshot, event) => {
            const movePageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            const movePageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            const newLeft = snapshot.startLeft + movePageX - snapshot.downPageX;
            const newTop = snapshot.startTop + movePageY - snapshot.downPageY;
            shell.style.left = `${newLeft >= 0 ? newLeft : 0}px`;
            shell.style.top = `${newTop >= 0 ? newTop : 0}px`;
        });

        let image = null;
        const text = document.createElement('p');
        text.className = 'p-window-text';
        caption.appendChild(text);
        Ui.on(caption, Ui.Events.DBLCLICK, () => {
            if (maximized) {
                restore();
            } else if (!minimized) {
                maximize();
            }
        });

        function moveLeft(snapshot, event) {
            const movePageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            let newLeft = snapshot.startLeft + movePageX - snapshot.downPageX;
            newLeft = newLeft >= 0 ? newLeft : 0;
            let newWidth = snapshot.startWidth - (newLeft - snapshot.startLeft);
            newWidth = newWidth >= 0 ? newWidth : 0;
            shell.style.left = `${newLeft}px`;
            content.style.width = `${newWidth}px`;
        }

        function moveRight(snapshot, event) {
            const movePageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            let newWidth = snapshot.startWidth + movePageX - snapshot.downPageX;
            newWidth = newWidth >= 0 ? newWidth : 0;
            content.style.width = `${newWidth}px`;
        }

        function moveTop(snapshot, event) {
            const movePageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            let newTop = snapshot.startTop + movePageY - snapshot.downPageY;
            newTop = newTop >= 0 ? newTop : 0;
            let newHeight = snapshot.startHeight - (newTop - snapshot.startTop);
            newHeight = newHeight >= 0 ? newHeight : 0;
            shell.style.top = `${newTop}px`;
            content.style.height = `${newHeight}px`;
        }

        function moveBottom(snapshot, event) {
            const movePageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            let newHeight = snapshot.startHeight + movePageY - snapshot.downPageY;
            newHeight = newHeight >= 0 ? newHeight : 0;
            content.style.height = `${newHeight}px`;
        }

        const t = document.createElement('div');
        t.className = 'p-window-t';
        decorationOnMove(t, moveTop);
        const l = document.createElement('div');
        l.className = 'p-window-l';
        decorationOnMove(l, moveLeft);
        const b = document.createElement('div');
        b.className = 'p-window-b';
        decorationOnMove(b, moveBottom);
        const r = document.createElement('div');
        r.className = 'p-window-r';
        decorationOnMove(r, moveRight);
        const tl = document.createElement('div');
        tl.className = 'p-window-tl';
        decorationOnMove(tl, (snapshot, event) => {
            moveTop(snapshot, event);
            moveLeft(snapshot, event);
        });
        const tr = document.createElement('div');
        decorationOnMove(tr, (snapshot, event) => {
            moveTop(snapshot, event);
            moveRight(snapshot, event);
        });
        tr.className = 'p-window-tr';
        const bl = document.createElement('div');
        bl.className = 'p-window-bl';
        decorationOnMove(bl, (snapshot, event) => {
            moveBottom(snapshot, event);
            moveLeft(snapshot, event);
        });
        const br = document.createElement('div');
        br.className = 'p-window-br';
        decorationOnMove(br, (snapshot, event) => {
            moveBottom(snapshot, event);
            moveRight(snapshot, event);
        });

        [t, l, r, b, tl, tr, bl, br, caption, content].forEach(item => {
            shell.appendChild(item);
        });

        const tools = document.createElement('div');
        tools.className = 'p-window-tools';
        const closeTool = document.createElement('div');
        closeTool.className = 'p-window-close-tool';
        Ui.on(closeTool, Ui.Events.CLICK, () => {
            close();
        });
        const minimizeTool = document.createElement('div');
        minimizeTool.className = 'p-window-minimize-tool';
        Ui.on(minimizeTool, Ui.Events.CLICK, () => {
            minimize();
        });
        const restoreTool = document.createElement('div');
        restoreTool.className = 'p-window-restore-tool';
        Ui.on(restoreTool, Ui.Events.CLICK, () => {
            restore();
        });
        const maximizeTool = document.createElement('div');
        maximizeTool.className = 'p-window-maximize-tool';
        Ui.on(maximizeTool, Ui.Events.CLICK, () => {
            maximize();
        });
        caption.appendChild(tools);
        [minimizeTool, restoreTool, maximizeTool, closeTool].forEach(tool => {
            tools.appendChild(tool);
        });

        Object.defineProperty(this, 'formKey', {
            get: function () {
                return formKey;
            },
            set: function (aValue) {
                if (formKey !== aValue) {
                    const formsMap = lookupFormsMap();
                    if (shell.parentElement)
                        formsMap.delete(formKey);
                    formKey = aValue;
                    if (shell.parentElement)
                        formsMap.set(formKey, self);
                    fireShownChange();
                }
            }
        });
        let defaultCloseOperation = 2;
        Object.defineProperty(this, 'defaultCloseOperation', {
            get: function () {
                return defaultCloseOperation;
            },
            set: function (aValue) {
                if (defaultCloseOperation !== aValue) {
                    defaultCloseOperation = aValue;
                }
            }
        });

        Object.defineProperty(this, 'icon', {
            get: function () {
                return image;
            },
            set: function (aValue) {
                if (image !== aValue) {
                    if (image) {
                        image.classList.remove('p-window-image');
                        caption.removeChild(image);
                    }
                    image = aValue;
                    if (image) {
                        caption.insertBefore(image, text);
                        image.classList.add('p-window-image');
                    }
                }
            }
        });
        Object.defineProperty(this, 'title', {
            get: function () {
                return text.innerText;
            },
            set: function (aValue) {
                if (text !== aValue) {
                    text.innerText = aValue;
                }
            }
        });
        Object.defineProperty(this, 'element', {
            get: function () {
                return shell;
            }
        });
        Object.defineProperty(this, 'modalMask', {
            get: function () {
                return modalMask;
            }
        });
        let resizable = true;
        let minimizable = true;
        var minimized = false;
        let maximizable = true;
        let closable = true;
        var maximized = false;
        let undecorated = false;
        const opacity = 1;
        let alwaysOnTop = false;
        let locationByPlatform = true;
        let showAtCenter = true;

        function updateToolsVisibility() {
            minimizeTool.style.display = minimizable && !minimized ? '' : 'none';
            maximizeTool.style.display = maximizable && !maximized && !minimized ? '' : 'none';
            restoreTool.style.display = minimized || maximized ? '' : 'none';
            closeTool.style.display = closable ? '' : 'none';
        }

        updateToolsVisibility();

        Object.defineProperty(this, 'resizable', {
            get: function () {
                return resizable;
            },
            set: function (aValue) {
                resizable = !!aValue;
                updateToolsVisibility();
            }
        });
        Object.defineProperty(this, 'minimizable', {
            get: function () {
                return minimizable;
            },
            set: function (aValue) {
                minimizable = !!aValue;
                updateToolsVisibility();
            }
        });
        Object.defineProperty(this, 'maximizable', {
            get: function () {
                return maximizable;
            },
            set: function (aValue) {
                maximizable = !!aValue;
                updateToolsVisibility();
            }
        });
        Object.defineProperty(this, 'closable', {
            get: function () {
                return closable;
            },
            set: function (aValue) {
                closable = !!aValue;
                updateToolsVisibility();
            }
        });
        Object.defineProperty(this, 'minimized', {
            get: function () {
                return minimized;
            }
        });
        Object.defineProperty(this, 'maximized', {
            get: function () {
                return maximized;
            }
        });
        Object.defineProperty(this, 'undecorated', {
            get: function () {
                return undecorated;
            },
            set: function (aValue) {
                undecorated = !!aValue;
                [caption, t, l, r, b, tl, tr, bl, br].forEach(decor => {
                    decor.style.display = undecorated ? 'none' : '';
                });
            }
        });
        Object.defineProperty(this, 'opacity', {
            get: function () {
                return opacity;
            },
            set: function (aValue) {
                if (opacity !== aValue) {
                    shell.style.opacity = isNaN(aValue) ? '' : aValue;
                }
            }
        });
        Object.defineProperty(this, 'alwaysOnTop', {
            get: function () {
                return alwaysOnTop;
            },
            set: function (aValue) {
                alwaysOnTop = !!aValue;
            }
        });
        Object.defineProperty(this, 'locationByPlatform', {
            get: function () {
                return locationByPlatform;
            },
            set: function (aValue) {
                locationByPlatform = !!aValue;
            }
        });
        Object.defineProperty(this, 'showAtCenter', {
            get: function () {
                return showAtCenter;
            },
            set: function (aValue) {
                showAtCenter = !!aValue;
            }
        });
        Object.defineProperty(this, 'left', {
            get: function () {
                return shell.offsetLeft;
            },
            set: function (aValue) {
                shell.style.left = `${aValue * 1}px`;
            }
        });
        Object.defineProperty(this, 'top', {
            get: function () {
                return shell.offsetTop;
            },
            set: function (aValue) {
                shell.style.top = `${aValue * 1}px`;
            }
        });
        Object.defineProperty(this, 'width', {
            get: function () {
                return shell.offsetWidth;
            },
            set: function (aValue) {
                content.style.width = `${aValue * 1 - (shell.offsetWidth - content.offsetWidth)}px`;
            }
        });
        Object.defineProperty(this, 'height', {
            get: function () {
                return shell.offsetHeight;
            },
            set: function (aValue) {
                content.style.height = `${aValue * 1 - (shell.offsetHeight - content.offsetHeight)}px`;
            }
        });

        let autoClose = false;

        function isOutsideOfWindow(event) {
            const absLeft = Ui.absoluteLeft(shell);
            const absTop = Ui.absoluteTop(shell);
            const pageX = 'pageX' in event ? event.pageX : event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            const pageY = 'pageY' in event ? event.pageY : event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            return pageX < absLeft || pageX > absLeft + shell.offsetWidth ||
                pageY < absTop || pageY > absTop + shell.offsetHeight;
        }

        let autoCloseMouseDownReg = null;
        let autoCloseTouchStartReg = null;

        function applyAutoClose() {
            if (autoCloseMouseDownReg) {
                autoCloseMouseDownReg.removeHandler();
                autoCloseMouseDownReg = null;
            }
            if (autoCloseTouchStartReg) {
                autoCloseTouchStartReg.removeHandler();
                autoCloseTouchStartReg = null;
            }
            if (autoClose && shell.parentElement) {
                autoCloseMouseDownReg = Ui.on(document, Ui.Events.MOUSEDOWN, evt => {
                    if (isOutsideOfWindow(evt) && evt.clientX < document.documentElement.offsetWidth /* click on scrollber shouldn't lead to closing of a window */) {
                        close();
                    }
                }, true);
                autoCloseTouchStartReg = Ui.on(document, Ui.Events.TOUCHSTART, evt => {
                    if (isOutsideOfWindow(evt)) {
                        close();
                    }
                }, true);
            }
        }

        Object.defineProperty(this, 'autoClose', {
            get: function () {
                return autoClose;
            },
            set: function (aValue) {
                if (autoClose !== aValue) {
                    autoClose = !!aValue;
                    applyAutoClose();
                }
            }
        });

        const windowOpenedHandlers = new Set();

        function addWindowOpenedHandler(h) {
            windowOpenedHandlers.add(h);
            return {
                removeHandler: function () {
                    windowOpenedHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowOpenedHandler', {
            get: function () {
                return addWindowOpenedHandler;
            }
        });

        function fireWindowOpened() {
            const formsMap = lookupFormsMap();
            formsMap.set(formKey, self);
            const event = new WindowEvent(self);
            windowOpenedHandlers.forEach(h => {
                Invoke.later(() => {
                    h(event);
                });
            });
            fireShownChange();
            applyAutoClose();
        }

        let onWindowOpened = null;
        let windowOpenedReg = null;
        Object.defineProperty(this, 'onWindowOpened', {
            get: function () {
                return onWindowOpened;
            },
            set: function (aValue) {
                if (windowOpenedReg) {
                    windowOpenedReg.removeHandler();
                    windowOpenedReg = null;
                }
                onWindowOpened = aValue;
                if (onWindowOpened) {
                    windowOpenedReg = addWindowOpenedHandler(onWindowOpened);
                }
            }
        });

        const windowClosingHandlers = new Set();

        function addWindowClosingHandler(h) {
            windowClosingHandlers.add(h);
            return {
                removeHandler: function () {
                    windowClosingHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowClosingHandler', {
            get: function () {
                return addWindowClosingHandler;
            }
        });

        function fireWindowClosing() {
            let canClose = true;
            const event = new WindowEvent(self);
            windowClosingHandlers.forEach(h => {
                if (h(event) === false) {
                    canClose = false;
                }
            });
            if (canClose) {
                const formsMap = lookupFormsMap();
                formsMap.delete(formKey);
            }
            return canClose;
        }

        let onWindowClosing = null;
        let windowClosingReg = null;
        Object.defineProperty(this, 'onWindowClosing', {
            get: function () {
                return onWindowClosing;
            },
            set: function (aValue) {
                if (windowClosingReg) {
                    windowClosingReg.removeHandler();
                    windowClosingReg = null;
                }
                onWindowClosing = aValue;
                if (onWindowClosing) {
                    windowClosingReg = addWindowClosingHandler(onWindowClosing);
                }
            }
        });

        const windowClosedHandlers = new Set();

        function addWindowClosedHandler(h) {
            windowClosedHandlers.add(h);
            return {
                removeHandler: function () {
                    windowClosedHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowClosedHandler', {
            get: function () {
                return addWindowClosedHandler;
            }
        });

        function fireWindowClosed(selectedItem) {
            const event = new WindowEvent(self);
            windowClosedHandlers.forEach(h => {
                Invoke.later(() => {
                    h(event);
                });
            });
            fireShownChange();
            if (autoCloseMouseDownReg) {
                autoCloseMouseDownReg.removeHandler();
                autoCloseMouseDownReg = null;
            }
            if (autoCloseTouchStartReg) {
                autoCloseTouchStartReg.removeHandler();
                autoCloseTouchStartReg = null;
            }
            if (onSelect) {
                const _onSelect = onSelect;
                onSelect = null;
                Invoke.later(() => {
                    _onSelect(selectedItem);
                });
            }
        }

        let onWindowClosed = null;
        let windowClosedReg = null;
        Object.defineProperty(this, 'onWindowClosed', {
            get: function () {
                return onWindowClosed;
            },
            set: function (aValue) {
                if (windowClosedReg) {
                    windowClosedReg.removeHandler();
                    windowClosedReg = null;
                }
                onWindowClosed = aValue;
                if (onWindowClosed) {
                    windowClosedReg = addWindowClosedHandler(onWindowClosed);
                }
            }
        });

        const windowMinimizedHandlers = new Set();

        function addWindowMinimizedHandler(h) {
            windowMinimizedHandlers.add(h);
            return {
                removeHandler: function () {
                    windowMinimizedHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowMinimizedHandler', {
            get: function () {
                return addWindowMinimizedHandler;
            }
        });

        function fireWindowMinimized() {
            const event = new WindowEvent(self);
            windowMinimizedHandlers.forEach(h => {
                Invoke.later(() => {
                    h(event);
                });
            });
        }

        let onWindowMinimized = null;
        let windowMinimizedReg = null;
        Object.defineProperty(this, 'onWindowMinimized', {
            get: function () {
                return onWindowMinimized;
            },
            set: function (aValue) {
                if (windowMinimizedReg) {
                    windowMinimizedReg.removeHandler();
                    windowMinimizedReg = null;
                }
                onWindowMinimized = aValue;
                if (onWindowMinimized) {
                    windowMinimizedReg = addWindowMinimizedHandler(onWindowMinimized);
                }
            }
        });

        const windowRestoredHandlers = new Set();

        function addWindowRestoredHandler(h) {
            windowRestoredHandlers.add(h);
            return {
                removeHandler: function () {
                    windowRestoredHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowRestoredHandler', {
            get: function () {
                return addWindowRestoredHandler;
            }
        });

        function fireWindowRestored() {
            const event = new WindowEvent(self);
            windowRestoredHandlers.forEach(h => {
                Invoke.later(() => {
                    h(event);
                });
            });
        }

        let onWindowRestored = null;
        let windowRestoredReg = null;
        Object.defineProperty(this, 'onWindowRestored', {
            get: function () {
                return onWindowRestored;
            },
            set: function (aValue) {
                if (windowRestoredReg) {
                    windowRestoredReg.removeHandler();
                    windowRestoredReg = null;
                }
                onWindowRestored = aValue;
                if (onWindowRestored) {
                    windowRestoredReg = addWindowRestoredHandler(onWindowRestored);
                }
            }
        });

        const windowMaximizedHandlers = new Set();

        function addWindowMaximizedHandler(h) {
            windowMaximizedHandlers.add(h);
            return {
                removeHandler: function () {
                    windowMaximizedHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowMaximizedHandler', {
            get: function () {
                return addWindowMaximizedHandler;
            }
        });

        function fireWindowMaximized() {
            const event = new WindowEvent(self);
            windowMaximizedHandlers.forEach(h => {
                Invoke.later(() => {
                    h(event);
                });
            });
        }

        let onWindowMaximized = null;
        let windowMaximizedReg = null;
        Object.defineProperty(this, 'onWindowMaximized', {
            get: function () {
                return onWindowMaximized;
            },
            set: function (aValue) {
                if (windowMaximizedReg) {
                    windowMaximizedReg.removeHandler();
                    windowMaximizedReg = null;
                }
                onWindowMaximized = aValue;
                if (onWindowMaximized) {
                    windowMaximizedReg = addWindowMaximizedHandler(onWindowMaximized);
                }
            }
        });

        const windowActivatedHandlers = new Set();

        function addWindowActivatedHandler(h) {
            windowActivatedHandlers.add(h);
            return {
                removeHandler: function () {
                    windowActivatedHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowActivatedHandler', {
            get: function () {
                return addWindowActivatedHandler;
            }
        });

        function fireWindowActivated() {
            const event = new WindowEvent(self);
            windowActivatedHandlers.forEach(h => {
                Invoke.later(() => {
                    h(event);
                });
            });
        }

        let onWindowActivated = null;
        let windowActivatedReg = null;
        Object.defineProperty(this, 'onWindowActivated', {
            get: function () {
                return onWindowActivated;
            },
            set: function (aValue) {
                if (windowActivatedReg) {
                    windowActivatedReg.removeHandler();
                    windowActivatedReg = null;
                }
                onWindowActivated = aValue;
                if (onWindowActivated) {
                    windowActivatedReg = addWindowActivatedHandler(onWindowActivated);
                }
            }
        });

        const windowDeactivatedHandlers = new Set();

        function addWindowDeactivatedHandler(h) {
            windowDeactivatedHandlers.add(h);
            return {
                removeHandler: function () {
                    windowDeactivatedHandlers.delete(h);
                }
            };
        }

        Object.defineProperty(this, 'addWindowDeactivatedHandler', {
            get: function () {
                return addWindowDeactivatedHandler;
            }
        });

        function fireWindowDeactivated() {
            const event = new WindowEvent(self);
            windowDeactivatedHandlers.forEach(h => {
                Invoke.later(() => {
                    h(event);
                });
            });
        }

        let onWindowDeactivated = null;
        let windowDeactivatedReg = null;
        Object.defineProperty(this, 'onWindowDeactivated', {
            get: function () {
                return onWindowDeactivated;
            },
            set: function (aValue) {
                if (windowDeactivatedReg) {
                    windowDeactivatedReg.removeHandler();
                    windowDeactivatedReg = null;
                }
                onWindowDeactivated = aValue;
                if (onWindowDeactivated) {
                    windowDeactivatedReg = addWindowDeactivatedHandler(onWindowDeactivated);
                }
            }
        });

        function lookupFormsMap() {
            return shell.parentElement.className.includes('p-widget') &&
            shell.parentElement.className.includes('p-container') ?
                shell.parentElement['p-widget'].shownForms :
                shownForms;
        }

        function activate() {
            if (shell.parentElement) {
                const formsMap = lookupFormsMap();
                if (!shell.className.includes('p-window-active')) {
                    Array.from(formsMap.values())
                        .filter(aWindow => aWindow !== self)
                        .forEach(aWindow => {
                            aWindow.deactivate();
                        });
                    shell.classList.add('p-window-active');
                    fireWindowActivated();
                }
            }
        }

        Object.defineProperty(this, 'activate', {
            get: function () {
                return activate;
            }
        });

        function deactivate() {
            if (shell.className.includes('p-window-active')) {
                shell.classList.remove('p-window-active');
                fireWindowDeactivated();
            }
        }

        Object.defineProperty(this, 'deactivate', {
            get: function () {
                return deactivate;
            }
        });

        function show() {
            if (!shell.parentElement) {
                document.body.appendChild(shell);
                if (locationByPlatform) {
                    if (!shell.style.left) {
                        shell.style.left = `${platformLocation.x}px`;
                    }
                    if (!shell.style.top) {
                        shell.style.top = `${platformLocation.y}px`;
                    }
                    platformLocation.x += DEFAULT_WINDOWS_SPACING_X;
                    if (platformLocation.x + shell.offsetWidth > window.innerWidth)
                        platformLocation.x = 0;
                    platformLocation.y += DEFAULT_WINDOWS_SPACING_Y;
                    if (platformLocation.y + shell.offsetHeight > window.innerHeight)
                        platformLocation.y = 0;
                } else if (showAtCenter) {
                    if (!shell.style.left) {
                        shell.style.left = `${(window.innerWidth - shell.offsetWidth) / 2}px`;
                    }
                    if (!shell.style.top) {
                        shell.style.top = `${(window.innerHeight - shell.offsetHeight) / 2}px`;
                    }
                }
                fireWindowOpened();
                activate();
            }
        }

        Object.defineProperty(this, 'show', {
            get: function () {
                return show;
            }
        });

        const modalMask = document.createElement('div');
        modalMask.className = 'p-window-modal-mask';
        var onSelect = null;

        function showModal(aOnSelect) {
            if (!shell.parentElement) {
                onSelect = aOnSelect;
                document.body.appendChild(modalMask);
                show();
            }
        }

        Object.defineProperty(this, 'showModal', {
            get: function () {
                return showModal;
            }
        });

        function showInternalFrame(aDesktop) {
            if (!shell.parentElement) {
                aDesktop.element.appendChild(shell);
                if (locationByPlatform) {
                    if (!shell.style.left) {
                        shell.style.left = `${aDesktop.platformLocationLeft}px`;
                    }
                    if (!shell.style.top) {
                        shell.style.top = `${aDesktop.platformLocationTop}px`;
                    }
                    aDesktop.platformLocationLeft += DEFAULT_WINDOWS_SPACING_X;
                    if (aDesktop.platformLocationLeft + shell.offsetWidth > aDesktop.element.clientWidth)
                        aDesktop.platformLocationLeft = 0;
                    aDesktop.platformLocationTop += DEFAULT_WINDOWS_SPACING_Y;
                    if (aDesktop.platformLocationTop + shell.offsetHeight > aDesktop.element.clientHeight)
                        aDesktop.platformLocationTop = 0;
                } else if (showAtCenter) {
                    if (!shell.style.left) {
                        shell.style.left = `${(aDesktop.element.offsetWidth - shell.offsetWidth) / 2}px`;
                    }
                    if (!shell.style.top) {
                        shell.style.top = `${(aDesktop.element.offsetHeight - shell.offsetHeight) / 2}px`;
                    }
                }
                fireWindowOpened();
                activate();
            }
        }

        Object.defineProperty(this, 'showInternalFrame', {
            get: function () {
                return showInternalFrame;
            }
        });

        function hide() {
            if (modalMask.parentElement)
                modalMask.parentElement.removeChild(modalMask);
            if (shell.parentElement)
                shell.parentElement.removeChild(shell);
        }

        function close(selectedItem) {
            if (shell.parentElement) {
                if (fireWindowClosing()) {
                    hide();
                    fireWindowClosed(selectedItem);
                }
            }
        }

        Object.defineProperty(this, 'close', {
            get: function () {
                return close;
            }
        });

        let sizePositionSnapshot = {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };

        function minimize() {
            if (!minimized) {
                if (maximized)
                    restore();
                sizePositionSnapshot = {
                    left: self.left,
                    top: self.top,
                    width: self.width,
                    height: self.height,
                    maximized
                };
                minimized = true;
                content.style.height = '0px';
                fireWindowMinimized();
                updateToolsVisibility();
            }
        }

        Object.defineProperty(this, 'minimize', {
            get: function () {
                return minimize;
            }
        });

        function maximize() {
            if (shell.parentElement) {
                if (!maximized && !minimized) {
                    sizePositionSnapshot = {
                        left: self.left,
                        top: self.top,
                        width: self.width,
                        height: self.height,
                        maximized
                    };
                    maximized = true;
                    self.left = self.top = 0;
                    if (shell.parentElement === document.body) {
                        self.width = window.innerWidth;
                        self.height = window.innerHeight;
                    } else {
                        self.width = shell.parentElement.clientWidth;
                        self.height = shell.parentElement.clientHeight;
                    }
                    fireWindowMaximized();
                    updateToolsVisibility();
                }
            }
        }

        Object.defineProperty(this, 'maximize', {
            get: function () {
                return maximize;
            }
        });

        function restore() {
            if (maximized || minimized) {
                minimized = false;
                maximized = sizePositionSnapshot.maximized;
                self.left = sizePositionSnapshot.left;
                self.top = sizePositionSnapshot.top;
                self.width = sizePositionSnapshot.width;
                self.height = sizePositionSnapshot.height;
                fireWindowRestored();
                updateToolsVisibility();
            }
        }

        Object.defineProperty(this, 'restore', {
            get: function () {
                return restore;
            }
        });

        function toFront() {
            if (shell.parentElement) {
                const targetParent = shell.parentElement;
                targetParent.removeChild(shell);
                targetParent.appendChild(shell);
                activate();
            }
        }

        Object.defineProperty(this, 'toFront', {
            get: function () {
                return toFront;
            }
        });
    }
}

Object.defineProperty(WindowPane, 'shown', {
    get: function () {
        return getShownForms;
    }
});

Object.defineProperty(WindowPane, 'getShownForm', {
    get: function () {
        return getShownForm;
    }
});

const shownChangeHandlers = new Set();

function addShownChangeHandler(h) {
    shownChangeHandlers.add(h);
    return {
        removeHandler: function () {
            shownChangeHandlers.delete(h);
        }
    };
}

Object.defineProperty(WindowPane, 'addShownChangeHandler', {
    get: function () {
        return addShownChangeHandler;
    }
});

function fireShownChange() {
    const event = new WindowEvent(shownForms);
    shownChangeHandlers.forEach(h => {
        Invoke.later(() => {
            h(event);
        });
    });
}

let onShownChange = null;
let shownChangeReg = null;
Object.defineProperty(WindowPane, 'onChange', {
    get: function () {
        return onShownChange;
    },
    set: function (aValue) {
        if (shownChangeReg) {
            shownChangeReg.removeHandler();
            shownChangeReg = null;
        }
        onShownChange = aValue;
        if (onShownChange) {
            shownChangeReg = addShownChangeHandler(onShownChange);
        }
    }
});

export default WindowPane;