import SensorsController from "../../src/subsystems/sensorsController.js";
export default class YourSensorsController extends SensorsController {
    sensorsUpdate(activeScan, passiveScan) {
        const scanResult = passiveScan();
        if (!(scanResult instanceof Error))
            this.target = scanResult[0];
    }
}
