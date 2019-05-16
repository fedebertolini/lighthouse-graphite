const graphite = require('graphite');
const GraphiteClient = require('../src/graphite-client');

jest.mock('graphite');

describe('graphite-client', () => {
    it('sends all metrics to graphite', async () => {
        const writeMock = jest.fn((metrics, callback) => callback());
        const endMock = jest.fn();
        graphite.createClient = jest.fn(() => ({
            write: writeMock,
            end: endMock,
        }));

        const client = new GraphiteClient('example.com', 'my-prefix');
        await client.send({
            interactive: {
                min: 5,
                max: 100,
                mean: 50,
                median: 60,
            },
            'time-to-first-byte': {
                min: 50,
                max: 200,
                mean: 121,
                median: 110,
            },
        });

        expect(graphite.createClient).toHaveBeenCalledWith('plaintext://example.com');
        expect(writeMock).toHaveBeenCalledWith(
            {
                'my-prefix.interactive.min': 5,
                'my-prefix.interactive.max': 100,
                'my-prefix.interactive.mean': 50,
                'my-prefix.interactive.median': 60,
                'my-prefix.time-to-first-byte.min': 50,
                'my-prefix.time-to-first-byte.max': 200,
                'my-prefix.time-to-first-byte.mean': 121,
                'my-prefix.time-to-first-byte.median': 110,
            },
            expect.any(Function)
        );
        expect(endMock).toHaveBeenCalled();
    });
});
