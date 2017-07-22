export function NgCalendarPicker(){
	'ngInject';

	let directive = {
		restrict: 'E',
		scope: {
			value: '='
		},
		controller: NgCalendarPickerController,
		controllerAs: 'vmCp',
		templateUrl: 'app/directives/ng-calendar-picker/ng-calendar-picker.html',
		link: function(scope, elem, attrs, ctrl){
			ctrl.init();
		}
	};

	return directive;
}

class NgCalendarPickerController {
	constructor($document, $element, $scope, moment){
		'ngInject';
		this.Document = $document;
		this.Element = $element;
		this.Scope = $scope;
		this.Moment = moment;
	}

	init(){

	}
}