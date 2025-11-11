import { set } from 'date-fns';
import { Event } from '../../model/event';
import { User } from '../../model/user';
import eventDb from '../../repository/event.db';
import userDb from '../../repository/user.db';
import eventService from '../../service/event.service';

const date = set(new Date('2025-11-10T00:00:00Z'), { hours: 10 });

const organiser = new User({
    id: 7,
    firstName: 'Pieter',
    lastName: 'De Vries',
    email: 'pieter@ucll.be',
    password: 'secret123',
    isOrganiser: true,
});

let mockGetAllEvents: jest.Mock;
let mockGetEventById: jest.Mock;
let mockGetEventsByOrganiserId: jest.Mock;
let mockCreateEvent: jest.Mock;
let mockFindFirstByOrganiserAndDay: jest.Mock;

let mockGetUserById: jest.Mock;
let mockGetUserByEmail: jest.Mock;

beforeEach(() => {
    mockGetAllEvents = jest.fn();
    mockGetEventById = jest.fn();
    mockGetEventsByOrganiserId = jest.fn();
    mockCreateEvent = jest.fn();
    mockFindFirstByOrganiserAndDay = jest.fn();

    mockGetUserById = jest.fn();
    mockGetUserByEmail = jest.fn();

    eventDb.getAllEvents = mockGetAllEvents;
    eventDb.getEventById = mockGetEventById;
    eventDb.getEventsByOrganiserId = mockGetEventsByOrganiserId;
    eventDb.createEvent = mockCreateEvent;
    eventDb.findFirstByOrganiserAndDay = mockFindFirstByOrganiserAndDay;
    userDb.getUserById = mockGetUserById;
    userDb.getUserByEmail = mockGetUserByEmail;
});

afterEach(() => {
    jest.clearAllMocks();
});

test('given events in repo, when getAllEvents, then returns those events', async () => {
    const ev1 = new Event({
        id: 1,
        name: 'Bierproeverij',
        description: 'Belgische bieren',
        date,
        location: 'Leuven',
        organiser,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const ev2 = new Event({
        id: 2,
        name: 'Chocolade workshop',
        description: 'Lekker',
        date,
        location: 'Brussel',
        organiser,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    mockGetAllEvents.mockResolvedValue([ev1, ev2]);

    const result = await eventService.getAllEvents();

    expect(mockGetAllEvents).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0].getName()).toBe('Bierproeverij');
});

test('given organiser auth, when getEventsForOrganiserView, then only own events are returned', async () => {
    mockGetUserByEmail.mockResolvedValue(organiser);

    const mine = [
        new Event({
            id: 11,
            name: 'Mijn 1',
            description: 'x',
            date,
            location: 'A',
            organiser,
            attendees: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        new Event({
            id: 12,
            name: 'Mijn 2',
            description: 'y',
            date,
            location: 'B',
            organiser,
            attendees: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    ];
    mockGetEventsByOrganiserId.mockResolvedValue(mine);

    const result = await eventService.getEventsForOrganiserView({
        organiserId: organiser.getId()!,
        email: organiser.getEmail(),
        isOrganiser: true,
    });

    expect(mockGetUserByEmail).toHaveBeenCalledWith({ email: organiser.getEmail() });
    expect(mockGetEventsByOrganiserId).toHaveBeenCalledWith({ organiserId: organiser.getId()! });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.getOrganiser().getId() === organiser.getId())).toBe(true);
});

test('given valid organiser, when createEvent, then event is created', async () => {
    mockGetUserById.mockResolvedValue(organiser);
    mockFindFirstByOrganiserAndDay.mockResolvedValue(null);

    const created = new Event({
        id: 99,
        name: 'Hike',
        description: 'Fun',
        date,
        location: 'Alpen',
        organiser,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    mockCreateEvent.mockResolvedValue(created);

    const result = await eventService.createEvent({
        name: 'Hike',
        description: 'Fun',
        date: date.toISOString(),
        location: 'Alpen',
        organiserId: organiser.getId()!,
    });

    expect(mockGetUserById).toHaveBeenCalledWith({ id: organiser.getId()! });
    expect(mockFindFirstByOrganiserAndDay).toHaveBeenCalledTimes(1);
    expect(mockCreateEvent).toHaveBeenCalledTimes(1);
    expect(result.getId()).toBe(99);
});

test('given same-day event exists, when createEvent, then throws conflict', async () => {
    mockGetUserById.mockResolvedValue(organiser);

    const existing = new Event({
        id: 1,
        name: 'Reeds gepland',
        description: 'x',
        date,
        location: 'Leuven',
        organiser,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    mockFindFirstByOrganiserAndDay.mockResolvedValue(existing);

    await expect(
        eventService.createEvent({
            name: 'Dubbel',
            description: 'mag niet',
            date: date.toISOString(),
            location: 'Leuven',
            organiserId: organiser.getId()!,
        })
    ).rejects.toThrow(/already has an experience on this date/i);

    expect(mockCreateEvent).not.toHaveBeenCalled();
});
