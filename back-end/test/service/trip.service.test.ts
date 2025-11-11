import { Trip } from '../../model/trip';
import { User } from '../../model/user';
import tripService from '../../service/trip.service';
import tripDb from '../../repository/trip.db';

let mockGetAllTrips: jest.Mock;
let mockGetTripById: jest.Mock;

beforeEach(() => {
    mockGetAllTrips = jest.fn();
    mockGetTripById = jest.fn();

    tripDb.getAllTrips = mockGetAllTrips;
    tripDb.getTripById = mockGetTripById;
});

afterEach(() => {
    jest.clearAllMocks();
});

test('given trips in repository, when getAllTrips is called, then returns those trips', async () => {
    const organiser = new User({
        firstName: 'Pieter',
        lastName: 'De Vries',
        email: 'pieter@ucll.be',
        password: 'secret123',
        isOrganiser: true,
    });

    const trip = new Trip({
        id: 1,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        destination: 'Brugge',
        startDate: new Date('2025-12-10T00:00:00Z'),
        endDate: new Date('2025-12-12T00:00:00Z'),
        description: 'Weekendje Brugge',
        organiser,
        attendees: [],
    });

    mockGetAllTrips.mockResolvedValue([trip]);

    const result = await tripService.getAllTrips();

    expect(mockGetAllTrips).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].getDestination()).toBe('Brugge');
});

test('given an existing trip, when getTripById is called, then returns that trip', async () => {
    const organiser = new User({
        firstName: 'Pieter',
        lastName: 'De Vries',
        email: 'pieter@ucll.be',
        password: 'secret123',
        isOrganiser: true,
    });

    const trip = new Trip({
        id: 42,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        destination: 'Gent',
        startDate: new Date('2025-12-10T00:00:00Z'),
        endDate: new Date('2025-12-12T00:00:00Z'),
        description: 'Citytrip',
        organiser,
        attendees: [],
    });

    mockGetTripById.mockResolvedValue(trip);

    const result = await tripService.getTripById({ id: 42 });

    expect(mockGetTripById).toHaveBeenCalledTimes(1);
    expect(mockGetTripById).toHaveBeenCalledWith({ id: 42 });
    expect(result.getId()).toBe(42);
    expect(result.getDestination()).toBe('Gent');
});

test('given no trip is found, when getTripById is called, then throws not-found error', async () => {
    mockGetTripById.mockResolvedValue(null);

    await expect(tripService.getTripById({ id: 999 })).rejects.toThrow(
        'Trip with id: 999 does not exist.'
    );
});

test('given past and future trips, when getUpcomingTrips is called, then only future trips are returned', async () => {
    const organiser = new User({
        firstName: 'Pieter',
        lastName: 'De Vries',
        email: 'pieter@ucll.be',
        password: 'secret123',
        isOrganiser: true,
    });

    const pastTrip = new Trip({
        id: 2,
        createdAt: new Date('2020-01-01T00:00:00Z'),
        updatedAt: new Date('2020-01-02T00:00:00Z'),
        destination: 'Old',
        startDate: new Date('2020-01-03T00:00:00Z'),
        endDate: new Date('2020-01-05T00:00:00Z'),
        description: 'Verleden',
        organiser,
        attendees: [],
    });

    const futureTrip = new Trip({
        id: 3,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        destination: 'Future',
        startDate: new Date('2030-01-03T00:00:00Z'),
        endDate: new Date('2030-01-05T00:00:00Z'),
        description: 'Toekomst',
        organiser,
        attendees: [],
    });

    mockGetAllTrips.mockResolvedValue([pastTrip, futureTrip]);
    const upcoming = await tripService.getUpcomingTrips();

    expect(mockGetAllTrips).toHaveBeenCalledTimes(1);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].getId()).toBe(3);
    expect(upcoming[0].getDestination()).toBe('Future');
});
