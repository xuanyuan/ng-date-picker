/* global moment:false */
import { NgDatetimePicker } from './directives/ng-datetime-picker/ng-datetime-picker.directive';
import { NgCalendarPicker } from './directives/ng-calendar-picker/ng-calendar-picker.directive';

angular.module('ngDatetimeRangePicker', [])
	.constant('moment', moment)
	.directive('ngCalendarPicker', NgCalendarPicker)
	.directive('ngDatetimePicker', NgDatetimePicker)
	.filter('timeNow', timeNow);

function timeNow(){
	return function(v, flag){
		return v <= 0 ? (flag == 'month' ? moment()[flag]() + 1 : moment()[flag]()) : v;
	}
}