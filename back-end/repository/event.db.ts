import { Event } from '../model/event';
import database from './database';

const getAllEvents = async (): Promise<Event[]> => {
    try {
        const rows = await database.event.findMany({
            include: { organiser: true, attendees: true },
        });
        return rows.map(Event.from);
    } catch (err) {
        console.error(err);
        throw new Error('Database error. See server log for details.');
    }
};

const getEventById = async ({ id }: { id: number }): Promise<Event | null> => {
    try {
        const row = await database.event.findUnique({
            where: { id },
            include: { organiser: true, attendees: true },
        });
        return row ? Event.from(row) : null;
    } catch (err) {
        console.error(err);
        throw new Error('Database error. See server log for details.');
    }
};

const getEventsByOrganiserId = async ({
    organiserId,
}: {
    organiserId: number;
}): Promise<Event[]> => {
    try {
        const rows = await database.event.findMany({
            where: { organiserId },
            include: { organiser: true, attendees: true },
        });
        return rows.map(Event.from);
    } catch (err) {
        console.error(err);
        throw new Error('Database error. See server log for details.');
    }
};

const createEvent = async (event: Event): Promise<Event> => {
    try {
        const created = await database.event.create({
            data: {
                name: event.getName(),
                description: event.getDescription(),
                date: event.getDate(),
                location: event.getLocation(),
                organiserId: event.getOrganiser().getId()!,
            },
            include: { organiser: true, attendees: true },
        });
        return Event.from(created);
    } catch (err) {
        console.error(err);
        throw new Error('Database error. See server log for details.');
    }
};

const findFirstByOrganiserAndDay = async ({
    organiserId,
    day,
}: {
    organiserId: number;
    day: Date;
}): Promise<Event | null> => {
    const start = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0)
    );
    const end = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1, 0, 0, 0)
    );

    try {
        const row = await database.event.findFirst({
            where: { organiserId, date: { gte: start, lt: end } },
            include: { organiser: true, attendees: true },
        });
        return row ? Event.from(row) : null;
    } catch (err) {
        console.error(err);
        throw new Error('Database error. See server log for details.');
    }
};

export default {
    getAllEvents,
    getEventById,
    getEventsByOrganiserId,
    findFirstByOrganiserAndDay,
    createEvent,
};
