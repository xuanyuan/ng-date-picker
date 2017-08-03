/* global moment:false */ 
import { NgTimePicker } from './directives/ng-time-picker/ng-time-picker.directive';
import { NgCalendarPicker } from './directives/ng-calendar-picker/ng-calendar-picker.directive';
import { NgDatePicker } from './directives/ng-date-picker/ng-date-picker.directive';


angular.module('ngDatetimeRangePicker', [])
	.constant('moment', moment)
	.directive('ngTimePicker', NgTimePicker)
	.directive('ngCalendarPicker', NgCalendarPicker)
	.directive('ngDatePicker', NgDatePicker);
