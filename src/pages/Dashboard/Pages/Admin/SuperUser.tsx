import { useEffect, useState } from "react";
import Calendar from "../../../../components/Calendar";
import { API_Event } from "../../../../api/api";

const DashboardSuperUser = () => {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        fetchEventData();
    }, []);

    const fetchEventData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(API_Event(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const data = result.data.map((event: any) => ({
                        title: event.type === 'DN' ? `DN : ${event.title}` : 
                            event.type === 'DN History' ? `DN : ${event.title}` :
                            event.type === 'PO' ? `PO : ${event.title}` : 
                            event.title,
                        start: new Date(event.start),
                        end: new Date(event.end),
                        type: event.type,
                        bp_code: event.bp_code,
                    }));
                    setEvents(data);
                } else {
                    console.error('Failed to load event data:', result.message);
                }
            } else {
                console.error('Failed to fetch event data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching event data:', error);
        }
    };

    return (
        <>
            <Calendar 
                events={events}
                defaultView="month"
            />
        </>
    );

}

export default DashboardSuperUser;