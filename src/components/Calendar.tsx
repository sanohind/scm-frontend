import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: string;
}

interface CalendarProps {
  events: Event[];
  defaultView?: typeof Views[keyof typeof Views];
}

const Calendar: React.FC<CalendarProps> = ({ events, defaultView = Views.MONTH }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const navigate = useNavigate();

  const onSelectEventHandler = (event: Event) => {
    Swal.fire({
      icon: 'info',
      title: event.title,
      html: `
      <div>
        <p>
          Start Date: <strong>${moment(event.start).format('MMMM D, YYYY')}</strong>
        </p>
        <p>
          End Date: <strong>${moment(event.end).format('MMMM D, YYYY HH:mm')}</strong>
        </p>
        <p>Type: ${event.type}</p>
      </div>
      `,
      confirmButtonColor: '#1e3a8a', 
      confirmButtonText: 'Go to Details',
      showCancelButton: true,
      cancelButtonText: 'Close',
      cancelButtonColor: '#dc2626',
    }).then((result) => {
      if (result.isConfirmed) {
        if (event.type === 'PO') {
          navigate(`/purchase-order-detail?noPO=${event.title.split(': ')[1]}`);
        } else if (event.type === 'DN') {
          navigate(`/delivery-note-detail?noDN=${event.title.split(': ')[1]}`);
        }
      }
    });
  };

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#039BE5'; // Default blue color like Google Calendar

    if (event.type === 'PO') {
      backgroundColor = '#4285F4'; // Google Calendar-like blue
    } else if (event.type === 'DN') {
      backgroundColor = '#0B8043'; // Google Calendar-like green
    }

    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 1,
      color: 'white',
      border: 'none',
      fontSize: '13px',
      fontWeight: '500',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
      display: 'block',
      padding: '4px 8px',
      margin: '1px 0',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer',
      ':hover': {
        opacity: 0.9,
      }
    };
    return {
      style,
    };
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <BigCalendar
        localizer={localizer}
        events={events}
        defaultView={defaultView}
        views={['month', 'week', 'day']}
        startAccessor="start"
        endAccessor="end"
        style={{ 
          height: 800,
          padding: '20px'
        }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEventHandler}
        toolbar={true}
        formats={{
          monthHeaderFormat: (date: Date) => moment(date).format('MMMM YYYY').toUpperCase(),
          dayHeaderFormat: (date: Date) => moment(date).format('dddd, MMMM D'),
          dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => 
            `${moment(start).format('MMM D')} – ${moment(end).format('MMM D, YYYY')}`,
        }}
        popup
        selectable
        className="custom-calendar"
        components={{
          eventWrapper: (props: any) => props.children,
          dateCellWrapper: ({ value, children }) => {
            const dayEvents = events.filter(
              event => moment(event.start).format('YYYY-MM-DD') === moment(value).format('YYYY-MM-DD')
            );
            
            if (dayEvents.length > 2) {
              return (
                <div className="rbc-day-bg relative h-full w-full" style={{ borderRight: '1px solid #e2e8f0' }}>
                  {children}
                  <div className="absolute bottom-0 left-0 right-0 px-1 pb-1 text-center">
                    <button
                      className="more-events-btn"
                      onClick={() => {
                        Swal.fire({
                          title: `Events on ${moment(value).format('MMMM D, YYYY')}`,
                          html: `
                            <div class="events-popup">
                              ${dayEvents.map(event => `
                                <div class="event-item-popup ${event.type === 'PO' ? 'po-event' : 'dn-event'}">
                                  <strong>${event.title}</strong><br>
                                  ${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}
                                </div>
                              `).join('')}
                            </div>
                          `,
                          confirmButtonColor: '#3C50E0',
                          width: '600px',
                        });
                      }}
                    >
                      +{dayEvents.length - 1} more
                    </button>
                  </div>
                </div>
              );
            }
            return children;
          }
        }}
      />
      <style>
        {`
          .custom-calendar .rbc-toolbar {
            padding: 15px;
            margin-bottom: 10px;
          }
          .custom-calendar .rbc-toolbar-label {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 10px 0;
          }
          .custom-calendar .rbc-toolbar button {
            background: transparent;
            color: #64748b;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            font-size: 0.875rem;
            transition: all 0.2s ease;
          }
          .custom-calendar .rbc-toolbar button.rbc-active,
          .custom-calendar .rbc-toolbar button:focus,
          .custom-calendar .rbc-toolbar button:hover {
            background: #3C50E0;
            color: white;
          }
          .custom-calendar .rbc-header {
            padding: 12px;
            font-weight: 500;
            color: #1e293b;
            background: #3C50E0;
            color: white;
          }
          .custom-calendar .rbc-header:contains('DECEMBER 2024') {
            background: #1e3a8a;
          }
          .custom-calendar .rbc-month-view {
            border: 1px solid #e2e8f0;
          }
          .custom-calendar .rbc-event {
            padding: 4px 8px;
            height: auto !important;
            min-height: 24px;
            position: relative;
            z-index: 1;
          }
          .custom-calendar .event-item {
            padding: 2px 4px;
            margin: 2px 0;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 4px;
          .custom-calendar .event-item {
            padding: 2px 4px;
            margin: 2px 0;
            background: rgba(60, 80, 224, 0.1);
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          }
          .custom-calendar .rbc-today {
            background-color: #e0e7ff;
          }
          .custom-calendar .rbc-month-row {
            border-color: #e2e8f0;
          }
          .custom-calendar .rbc-date-cell {
            padding: 8px;
            font-weight: 500;
            color: #1e293b;
          }
          .more-events-btn {
            background: rgba(60, 80, 224, 0.1);
            color: #3C50E0;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            border: none;
            display: inline-block;
          }
          .event-item-popup {
            margin: 8px 0;
            padding: 8px;
            border-radius: 4px;
          }
          .event-item-popup.po-event {
            background-color: #4285F4;
            color: white;
          }
          .event-item-popup.dn-event {
            background-color: #0B8043;
            color: white;
          }
        `}
      </style>
      {selectedEvent && (
        <Modal
          isOpen={true}
          onRequestClose={closeModal}
          contentLabel="Event Details"
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '400px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0'
            }
          }}
        >
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">{selectedEvent.title}</h2>
          <p className="mb-2 text-black dark:text-white">
            Date: <strong>{moment(selectedEvent.start).format('MMMM D, YYYY')}</strong>
          </p>
          <p className="mb-4 text-black dark:text-white">Type: {selectedEvent.type}</p>
          <button 
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 rounded-sm hover:bg-gray-300 transition-colors text-black"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;