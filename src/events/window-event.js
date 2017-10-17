import Event from 'kenga/event';

class WindowEvent extends Event {
    constructor(w) {
        super(w, w);
    }
}
export default WindowEvent;