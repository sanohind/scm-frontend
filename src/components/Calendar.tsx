import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  type: string;
}

interface CalendarProps {
  events: Event[];
  defaultView?: typeof Views[keyof typeof Views];
}

const Calendar: React.FC<CalendarProps> = ({ events, defaultView = Views.MONTH }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const onSelectEventHandler = (event: Event) => {
    Swal.fire({
      title: event.title,
      html: (
        <div>
          <p>
            Date: <strong>{moment(event.start).format('MMMM D, YYYY')}</strong>
          </p>
          <p>Type: {event.type}</p>
        </div>
      ),
      confirmButtonText: 'Close',
    });
  };

  const eventStyleGetter = (event: Event) => {
    const backgroundColor = event.color || '#3174ad';
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <BigCalendar
        localizer={localizer}
        events={events}
        defaultView={defaultView}
        views={['month', 'week', 'day']}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEventHandler}
      />
      {selectedEvent && (
        <Modal
          isOpen={true}
          onRequestClose={closeModal}
          contentLabel="Event Details"
        >
          <h2>{selectedEvent.title}</h2>
          <p>
            Date:{' '}
            <strong>
              {moment(selectedEvent.start).format('MMMM D, YYYY')}
            </strong>
          </p>
          <p>Type: {selectedEvent.type}</p>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;