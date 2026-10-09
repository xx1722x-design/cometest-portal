import $j from 'jquery';
import { locationPaths } from '../../assets/index';

export class Locations {
	protected readonly locations: string[] = locationPaths;

	renderLocations() {
		$j('#combatLocation').append(
			`<input type="radio" id="bgOpt-1" ` +
				'name="combatLocation" ' +
				`value="${this.locations[Math.floor(Math.random() * this.locations.length)]}">` +
				`<label for="bgOpt${-1}" class="dragIt">` +
				`⚄</label>`,
		);
		$j('#bgOpt-1').prop('checked', true);
		for (let index = 0; index < this.locations.length; index += 1) {
			$j('#combatLocation').append(
				`<input type="radio" id="bgOpt${index + 1}" ` +
					'name="combatLocation" ' +
					`value="${this.locations[index]}">` +
					`<label for="bgOpt${index + 1}" class="dragIt">` +
					`${this.locations[index]}</label>`,
			);
		}
	}
}
