/* global expect */
/* global NaN */
import '../src/layout.css';
import '../src/theme.css';

import Logger from 'septima-utils/logger';
import Invoke from 'septima-utils/invoke';
import Resource from 'septima-remote/resource';
import Ui from 'kenga/utils';
import DesktopPane from 'kenga-containers/desktop-pane';
import WindowPane from '../src/window-pane';

describe('Window Api', () => {

    function expectWindow(instance) {
        instance.minimizable = false;
        instance.minimizable = false;
        instance.minimizable = !instance.minimizable;
        instance.minimizable = true;
        instance.maximizable = false;
        instance.maximizable = false;
        instance.maximizable = !instance.maximizable;
        instance.maximizable = true;
        instance.alwaysOnTop = true;
        instance.alwaysOnTop = true;
        instance.alwaysOnTop = !instance.alwaysOnTop;
        instance.alwaysOnTop = false;
        instance.locationByPlatform = false;
        instance.locationByPlatform = false;
        instance.locationByPlatform = !instance.locationByPlatform;
        instance.locationByPlatform = true;
        instance.closable = false;
        instance.closable = false;
        instance.closable = !instance.closable;
        instance.closable = true;
        instance.resizable = false;
        instance.resizable = false;
        instance.resizable = !instance.resizable;
        instance.resizable = true;
        instance.undecorated = true;
        instance.undecorated = true;
        instance.undecorated = !instance.undecorated;
        instance.undecorated = false;
        instance.opacity = 0.2;
        instance.opacity = 0.2;
        instance.opacity += 0.3;
        instance.opacity = 1;
        instance.addWindowOpenedHandler(evt => {
            Logger.info(`${evt.source.constructor.name} opened`);
        });
        instance.addWindowActivatedHandler(evt => {
            Logger.info(`${evt.source.constructor.name} activated`);
        });
        instance.addWindowDeactivatedHandler(evt => {
            Logger.info(`${evt.source.constructor.name} deactivated`);
        });
        instance.addWindowClosingHandler(evt => {
            Logger.info(`${evt.source.constructor.name} is about to close`);
        });
        instance.addWindowClosedHandler(evt => {
            Logger.info(`${evt.source.constructor.name} closed`);
        });
        instance.addWindowMinimizedHandler(evt => {
            Logger.info(`${evt.source.constructor.name} minimized`);
        });
        instance.addWindowMaximizedHandler(evt => {
            Logger.info(`${evt.source.constructor.name} maximized`);
        });
        instance.addWindowRestoredHandler(evt => {
            Logger.info(`${evt.source.constructor.name} restored`);
        });
    }

    it('Caption', done => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        expect(instance.title).toEqual('Sample window');
        instance.show();
        instance.left = 400;
        instance.top = 150;
        instance.width = instance.height = 200;
        Resource.Icon.load('../assets/binary-content.png')
                .then(loaded => {
                    instance.icon = loaded;
                })
                .then(() => {
                    instance.close();
                })
                .then(done)
                .catch(done.fail);
    });
    it('Events', done => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        expect(instance.title).toEqual('Sample window');

        spyOn(instance, 'onWindowOpened');
        spyOn(instance, 'onWindowActivated');
        spyOn(instance, 'onWindowDeactivated');
        spyOn(instance, 'onWindowClosing');
        spyOn(instance, 'onWindowClosed');
        spyOn(instance, 'onWindowMinimized');
        spyOn(instance, 'onWindowMaximized');
        spyOn(instance, 'onWindowRestored');

        instance.show();
        instance.left = 400;
        instance.top = 150;
        instance.width = instance.height = 200;
        Resource.Icon.load('../assets/binary-content.png')
                .then(loaded => {
                    instance.icon = loaded;
                    instance.maximize();
                    instance.restore();
                    instance.minimize();
                    return new Promise((resolve) => Invoke.later(resolve));
                })
                .then(() => {
                    instance.close();
                    return new Promise((resolve) => Invoke.later(resolve));
                })
                .then(() => {
                    expect(instance.onWindowOpened.calls.count()).toEqual(1);
                    expect(instance.onWindowActivated.calls.count()).toEqual(1);
                    expect(instance.onWindowClosing.calls.count()).toEqual(1);
                    expect(instance.onWindowClosed.calls.count()).toEqual(1);
                    expect(instance.onWindowMinimized.calls.count()).toEqual(1);
                    expect(instance.onWindowMaximized.calls.count()).toEqual(1);
                    expect(instance.onWindowRestored.calls.count()).toEqual(1);
                })
                .then(done)
                .catch(done.fail);
    });
    it('Selector', done => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        instance.left = instance.top = 200;
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        const toBeSelected = {};
        instance.showModal(selected => {
            expect(selected).toBe(toBeSelected);
            done();
        });
        instance.close(toBeSelected);
    });
    it('AutoClose', () => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        instance.left = instance.top = 200;
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        instance.autoClose = true;
        instance.close();
    });
    it('Undecorated', () => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        instance.left = instance.top = 200;
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        instance.undecorated = true;
        instance.undecorated = false;
        instance.close();
    });
    it('LocationByPlatform', () => {
        for (let i = 0; i < 50; i++) {
            const instance = new WindowPane();
            expectWindow(instance, Logger);
            instance.title = `Sample window ${i}`;
            instance.width = instance.height = 200;
            expect(instance.title).toEqual(`Sample window ${i}`);
            instance.show();
            instance.close();
        }
    });
    it('Shown', (done) => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        spyOn(WindowPane, 'onChange');
        instance.title = 'Sample window';
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        expect(WindowPane.getShownForm(instance.formKey)).toBe(instance);
        expect(WindowPane.shown()).toEqual([instance]);
        const instance1 = new WindowPane();
        expectWindow(instance1, Logger);
        instance1.title = 'Sample window';
        instance1.width = instance1.height = 200;
        expect(instance1.title).toEqual('Sample window');
        instance1.show();
        expect(WindowPane.getShownForm(instance1.formKey)).toBe(instance1);
        expect(WindowPane.shown()).toEqual([instance, instance1]);
        instance.close();
        expect(WindowPane.getShownForm(instance1.formKey)).toBe(instance1);
        expect(WindowPane.shown()).toEqual([instance1]);
        instance1.formKey = 'new key';
        expect(WindowPane.getShownForm('new key')).toBe(instance1);
        expect(WindowPane.shown()).toEqual([instance1]);
        instance1.close();
        expect(WindowPane.shown()).toEqual([]);
        Invoke.later(() => {
            expect(WindowPane.onChange.calls.count()).toEqual(5);
            done();
        });
    });
    it('Active', done => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        spyOn(instance, 'onWindowDeactivated');
        instance.title = 'Sample window';
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        const instance1 = new WindowPane();
        expectWindow(instance1, Logger);
        spyOn(instance1, 'onWindowActivated');
        instance1.title = 'Sample window';
        instance1.width = instance1.height = 200;
        expect(instance1.title).toEqual('Sample window');
        instance1.show();
        Invoke.later(() => {
            expect(instance.onWindowDeactivated.calls.count()).toEqual(1);
            expect(instance1.onWindowActivated.calls.count()).toEqual(1);
            instance.close();
            instance1.close();
            done();
        });
    });
    it('Interaction', () => {
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        instance.close();
    });
    it('DesktopPane.Operations', () => {
        const desktop = new DesktopPane();
        desktop.width = desktop.height = 400;
        document.body.appendChild(desktop.element);
        const instance1 = new WindowPane();
        expectWindow(instance1, Logger);
        instance1.title = 'Sample window';
        instance1.width = instance1.height = 200;
        expect(instance1.title).toEqual('Sample window');
        instance1.showInternalFrame(desktop);
        const instance2 = new WindowPane();
        expectWindow(instance2, Logger);
        instance2.title = 'Sample window';
        instance2.width = instance2.height = 200;
        expect(instance2.title).toEqual('Sample window');
        instance2.showInternalFrame(desktop);
        desktop.maximizeAll();
        desktop.restoreAll();
        desktop.minimizeAll();
        desktop.closeAll();
        document.body.removeChild(desktop.element);
    });
    it('DesktopPane.LocationByPlatform', () => {
        const desktop = new DesktopPane();
        desktop.width = desktop.height = 400;
        document.body.appendChild(desktop.element);
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        for (let i = 0; i < 50; i++) {
            const internalFrame = new WindowPane();
            expectWindow(internalFrame, Logger);
            internalFrame.title = `Sample window ${i}`;
            internalFrame.width = internalFrame.height = 200;
            expect(internalFrame.title).toEqual(`Sample window ${i}`);
            internalFrame.showInternalFrame(desktop);
            instance.close();
        }
        instance.close();
        document.body.removeChild(desktop.element);
    });
    it('DesktopPane.Shown', () => {
        const desktop = new DesktopPane();
        desktop.width = desktop.height = 400;
        document.body.appendChild(desktop.element);
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        instance.title = 'Sample window';
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        expect(WindowPane.getShownForm(instance.formKey)).toBe(instance);
        expect(WindowPane.shown()).toEqual([instance]);
        const instance1 = new WindowPane();
        expectWindow(instance1, Logger);
        instance1.title = 'Sample window';
        instance1.width = instance1.height = 200;
        expect(instance1.title).toEqual('Sample window');
        instance1.showInternalFrame(desktop);
        expect(desktop.getShownForm(instance1.formKey)).toBe(instance1);
        expect(desktop.shown()).toEqual([instance1]);
        const instance2 = new WindowPane();
        expectWindow(instance2, Logger);
        instance2.title = 'Sample window';
        instance2.width = instance2.height = 200;
        expect(instance2.title).toEqual('Sample window');
        instance2.showInternalFrame(desktop);
        expect(desktop.shown()).toEqual(desktop.forms);
        expect(desktop.getShownForm(instance2.formKey)).toBe(instance2);
        expect(desktop.shown()).toEqual([instance1, instance2]);
        instance1.close();
        expect(desktop.getShownForm(instance2.formKey)).toBe(instance2);
        expect(desktop.shown()).toEqual([instance2]);
        instance2.formKey = 'new key';
        expect(desktop.getShownForm('new key')).toBe(instance2);
        expect(desktop.shown()).toEqual([instance2]);
        instance2.close();
        expect(desktop.shown()).toEqual([]);
        instance.close();
        expect(WindowPane.shown()).toEqual([]);
        document.body.removeChild(desktop.element);
    });
    it('DesktopPane.Active', done => {
        const desktop = new DesktopPane();
        desktop.width = desktop.height = 400;
        document.body.appendChild(desktop.element);
        const instance = new WindowPane();
        expectWindow(instance, Logger);
        spyOn(instance, 'onWindowDeactivated');
        instance.title = 'Sample window';
        instance.width = instance.height = 200;
        expect(instance.title).toEqual('Sample window');
        instance.show();
        const instance1 = new WindowPane();
        expectWindow(instance1, Logger);
        spyOn(instance1, 'onWindowDeactivated');
        instance1.title = 'Sample window';
        instance1.width = instance1.height = 200;
        expect(instance1.title).toEqual('Sample window');
        instance1.showInternalFrame(desktop);
        const instance2 = new WindowPane();
        expectWindow(instance2, Logger);
        spyOn(instance2, 'onWindowActivated');
        instance2.title = 'Sample window';
        instance2.width = instance2.height = 200;
        expect(instance2.title).toEqual('Sample window');
        instance2.showInternalFrame(desktop);
        Invoke.later(() => {
            expect(instance.onWindowDeactivated.calls.count()).toEqual(0);
            expect(instance1.onWindowDeactivated.calls.count()).toEqual(1);
            expect(instance2.onWindowActivated.calls.count()).toEqual(1);
            instance.close();
            instance1.close();
            instance2.close();
            document.body.removeChild(desktop.element);
            done();
        });
    });
});
