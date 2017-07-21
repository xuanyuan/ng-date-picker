/* global moment:false */
// import { NgDatetimePicker } from './directives/ng-datetime-picker/ng-datetime-picker.directive';
// import { NgCalendarPicker } from './directives/ng-calendar-picker/ng-calendar-picker.directive';
import { NgDatePicker } from './directives/ng-date-picker/ng-date-picker.directive';

angular.module('ngDatetimeRangePicker', [])
	.constant('moment', moment)
	// .directive('ngCalendarPicker', NgCalendarPicker)
	// .directive('ngDatetimePicker', NgDatetimePicker)
	.directive('ngDatePicker', NgDatePicker)
	.filter('timeNow', timeNow);

function timeNow(){
	return function(v, flag){
		return v <= 0 ? (flag == 'month' ? moment()[flag]() + 1 : moment()[flag]()) : v;
	}
}