import { UnauthorizedError } from 'express-jwt';
import eventDb from '../repository/event.db';
import userDb from '../repository/user.db';
import { Event } from '../model/event';
import { EventInput, OrganiserViewInput } from '../types';

const getAllEvents = async (): Promise<Event[]> => {
    return await eventDb.getAllEvents();
};

const getEventById = async ({ id }: { id: number }): Promise<Event> => {
    const event = await eventDb.getEventById({ id });
    if (!event) throw new Error(`Event with id: ${id} does not exist.`);
    return event;
};

const getEventsForOrganiserView = async ({
    organiserId,
    email,
    isOrganiser,
}: OrganiserViewInput): Promise<Event[]> => {
    if (!organiserId) throw new Error('organiserId is required');
    if (!isOrganiser) {
        throw new UnauthorizedError('credentials_required', {
            message: 'Only organisers can access this resource.',
        });
    }

    const me = await userDb.getUserByEmail({ email });
    if (!me) {
        throw new UnauthorizedError('credentials_required', {
            message: 'Invalid credentials.',
        });
    }
    if (me.getId() !== organiserId) {
        throw new UnauthorizedError('credentials_required', {
            message: 'You are not authorized to access this resource.',
        });
    }

    return await eventDb.getEventsByOrganiserId({ organiserId });
};

const createEvent = async ({
    name,
    description,
    date,
    location,
    organiserId,
}: EventInput): Promise<Event> => {
    if (!name) throw new Error('name is required');
    if (!date) throw new Error('date is required');
    if (!location) throw new Error('location is required');
    if (!organiserId) throw new Error('organiserId is required');

    const organiser = await userDb.getUserById({ id: organiserId });
    if (!organiser) throw new Error(`User with id: ${organiserId} does not exist.`);
    if (!organiser.getIsOrganiser()) {
        throw new UnauthorizedError('credentials_required', {
            message: 'User must have organiser role to organise events',
        });
    }

    const jsDate = new Date(date);

    const conflict = await eventDb.findFirstByOrganiserAndDay({
        organiserId,
        day: jsDate,
    });
    if (conflict) {
        throw new Error('Organiser already has an experience on this date.');
    }

    const event = new Event({
        name,
        description,
        date: new Date(date),
        location,
        organiser,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return await eventDb.createEvent(event);
};

export default {
    getAllEvents,
    getEventById,
    getEventsForOrganiserView,
    createEvent,
};
