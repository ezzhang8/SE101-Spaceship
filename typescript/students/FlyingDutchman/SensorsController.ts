import { withinPiRange, Vector2 } from '../helpers.js'
import SensorsController from '../../src/subsystems/sensorsController.js'
import YourDefenceController from './DefenseController.js'
import YourNavigationController from './NavigationController.js'
import YourPropulsionController from './PropulsionController.js'
import { EMSReading, PassiveReading } from '../types.js'
export default class YourSensorsController extends SensorsController {
	// To get other subsystem information, use the attributes below.
	// @ts-ignore
	defence: YourDefenceController // @ts-ignore
	navigation: YourNavigationController // @ts-ignore
	propulsion: YourPropulsionController //@ts-ignore
	target: PassiveReading | null = null 

	//Add additional attributes here

	sensorsUpdate(activeScan: (heading: number, arc: number, range: number) => EMSReading[] | Error, passiveScan: () => PassiveReading[] | Error) {
		const scanResult = passiveScan()
		if (!(scanResult instanceof Error)) this.target = scanResult[0]
	}
}


// accurate vector coordinates (angle, distance) of warpgates and planets - navigation
// angle, heading, velocity, distance of asteroids - defense

// passive scan - heading, mass/distance - warpgates accurate position
// active scan - angle, distance, velocity, radius
				// close range - type, habitability
