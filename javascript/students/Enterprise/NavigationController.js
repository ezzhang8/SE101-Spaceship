import NavigationController from '../../src/subsystems/navigationController.js';
export default class YourNavigationController extends NavigationController {
    constructor() {
        super(...arguments);
        this.angle = 0; //initializes angle
    }
    navigationUpdate(getShipStatus, warp, land, getMapData) {
        this.angle = getShipStatus("angle");
    }
}
