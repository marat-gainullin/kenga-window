import Event from '../event';
import extend from 'core/extend';

function WindowEvent(w) {
    Event.call(this, w, w);
}
extend(WindowEvent, Event);
export default WindowEvent;