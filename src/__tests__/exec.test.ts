import { normalAdb, getDevList, execAdb } from '../exec';

beforeEach(() => {
  Object.assign(global, {
    console: {
      log: jest.fn(),
    },
  });
});

describe("exec's ", () => {
  describe('runNormalAdb', () => {
    it('pipes to stdio & stderr', done => {
      normalAdb(['shell']).then(() => {
        const mockedConsole: any = global.console.log;
        const consoleCalls = mockedConsole.mock.calls;

        expect(consoleCalls[0]).toHaveLength(1);
        expect(consoleCalls[0][0]).toHaveProperty('_isStdio', true);
        done();
      });
    });
    it('logs successfuly with proper adb args', done => {
      normalAdb(['shell']).then(output => {
        expect(output).toHaveProperty('stderr', 'success');
        expect(output).toHaveProperty('stdout', 'success');
        done();
      });
    });

    it('logs error when not valid command passed', done => {
      normalAdb(['unknown'])
        .then()
        .catch(error => {
          expect(error).toHaveProperty('stderr', 'Not a valid command');
          done();
        });
    });
  });

  describe('getAllDevices', () => {
    it('returns all devices (target: all)', done => {
      getDevList('all').then(devList => {
        const expectedList = [
          'SQRLPD135523',
          'emulator-3432',
          'BAM35334AR',
          'DEEM32AR2',
          'emulator-2212',
        ];

        expect(devList).toHaveLength(5);
        expect(devList).toEqual(expect.arrayContaining(expectedList));
        done();
      });
    });
    it('returns all emulators', done => {
      getDevList('emu').then(devList => {
        const expectedList = ['emulator-3432', 'emulator-2212'];

        expect(devList).toHaveLength(2);
        expect(devList).toEqual(expect.arrayContaining(expectedList));
        done();
      });
    });
    it('returns all real devices', done => {
      getDevList('dev').then(devList => {
        const expectedList = ['SQRLPD135523', 'BAM35334AR', 'DEEM32AR2'];

        expect(devList).toHaveLength(3);
        expect(devList).toEqual(expect.arrayContaining(expectedList));
        done();
      });
    });
    it('returns empty array if no devices', done => {
      getDevList(null).then(devList => {
        expect(devList).toHaveLength(0);

        done();
      });
    });
  });

  describe('execAdbForDevice', () => {
    const devList = ['RDG123321', 'emulator123'];

    it('executes adb for each device', done => {
      const promiseList = [];
      const expectedStdout = expect.stringMatching(/Device \w+ success/);
      devList.forEach(dev => {
        promiseList.push(execAdb(dev, ['netstat']));
      });
      Promise.all(promiseList).then(outputs => {
        outputs.forEach(devOutput => {
          const { stdout } = devOutput;

          expect(stdout).toEqual(expectedStdout);
        });

        done();
      });
    });
  });
});
