import { set } from 'date-fns';
import { Trip } from '../../model/trip';
import { User } from '../../model/user';

const start = set(new Date(), { hours: 8, minutes: 30 });
const end = set(new Date(), { hours: 10, minutes: 30 });

const organiser = new User({
    firstName: 'Pieter',
    lastName: 'De Vries',
    email: 'pieter@ucll.be',
    password: 'secret123',
    isOrganiser: true,
});

const client = new User({
    firstName: 'Jan',
    lastName: 'Peeters',
    email: 'jan@ucll.be',
    password: 'jan12345',
    isOrganiser: false,
});

test('given: valid values, when: trip is created, then: fields are set', () => {
    // when
    const trip = new Trip({
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        destination: 'Brugge',
        startDate: start,
        endDate: end,
        description: 'Weekendje Brugge',
        organiser,
        attendees: [],
    });

    // then
    expect(trip.getId()).toBe(1);
    expect(trip.getDestination()).toBe('Brugge');
    expect(trip.getStartDate()).toEqual(start);
    expect(trip.getEndDate()).toEqual(end);
    expect(trip.getDescription()).toBe('Weekendje Brugge');
    expect(trip.getOrganiser().getEmail()).toBe('pieter@ucll.be');
    expect(trip.getAttendees()).toEqual([]);
});

test('given: end date before or equal start date, when: creating trip, then: throws', () => {
    const sameEnd = () =>
        new Trip({
            createdAt: new Date(),
            updatedAt: new Date(),
            destination: 'Gent',
            startDate: start,
            endDate: start,
            description: 'x',
            organiser,
            attendees: [],
        });

    const beforeEnd = () =>
        new Trip({
            createdAt: new Date(),
            updatedAt: new Date(),
            destination: 'Gent',
            startDate: end,
            endDate: start,
            description: 'x',
            organiser,
            attendees: [],
        });

    expect(sameEnd).toThrow(/End date must be after start date/i);
    expect(beforeEnd).toThrow(/End date must be after start date/i);
});

test('given: organiser is not an organiser, when: creating trip, then: throws', () => {
    const notOrganiser = client;
    const create = () =>
        new Trip({
            createdAt: new Date(),
            updatedAt: new Date(),
            destination: 'Antwerpen',
            startDate: start,
            endDate: end,
            description: 'x',
            organiser: notOrganiser,
            attendees: [],
        });

    expect(create).toThrow(/must be an organiser/i);
});

test('given: attendees list, when: add/remove/isUserAttending, then: behaves correctly', () => {
    const attendeeA = new User({
        firstName: 'Els',
        lastName: 'Van den Berg',
        email: 'els@ucll.be',
        password: 'els12345',
        isOrganiser: false,
        id: 2,
    });
    const attendeeB = new User({
        firstName: 'Koen',
        lastName: 'Willems',
        email: 'koen@ucll.be',
        password: 'koen12345',
        isOrganiser: false,
        id: 3,
    });

    const trip = new Trip({
        createdAt: new Date(),
        updatedAt: new Date(),
        destination: 'Leuven',
        startDate: start,
        endDate: end,
        description: 'x',
        organiser,
        attendees: [],
    });

    trip.addAttendee(attendeeA);
    trip.addAttendee(attendeeB);
    trip.addAttendee(attendeeA);

    expect(trip.getAttendees().map((u) => u.getId())).toEqual([2, 3]);

    // aanwezig?
    expect(trip.isUserAttending(2)).toBe(true);
    expect(trip.isUserAttending(99)).toBe(false);

    // remove
    trip.removeAttendee(2);
    expect(trip.isUserAttending(2)).toBe(false);
    expect(trip.getAttendees().map((u) => u.getId())).toEqual([3]);
});
