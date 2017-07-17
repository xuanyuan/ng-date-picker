export function NgDatetimePicker() {
	'ngInject';

	let directive = {
		restrict: 'E',
		scope: {
			range: '=',
			format: '@',
			config: '=',
			placeholder: '@',
			diff: '='
		},
		controller: NgDatetimePickerController,
		templateUrl: 'app/directives/ng-datetime-picker/ng-datetime-picker.html',
		controllerAs: 'vmDtp',
		link: (scope, elem, attrs, ctrl) => {
			ctrl.init();
		}
	};

	return directive;
}

class NgDatetimePickerController {
	constructor($document, $element, $scope, moment) {
		'ngInject';
		this.Document = $document;
		this.Element = $element;
		this.Scope = $scope;
		this.Moment = moment;
	}

	init() {
		this.panelStatus = false;
		this.setToolMethods();
		this.setViewMethods();
		this.setWatchers();
		this.getConf();
	}

	setWatchers(){
		let range = this.Scope.range;
		let methods = this.methods;
		this.startTime = methods.formatMoment(range.start);
		this.endTime = methods.formatMoment(range.end);

		// 观察时间
		this.Scope.$watch('vmDtp.startTime', v => {
			range.start = v;
			this.getConf();
		}, true);

		this.Scope.$watch('vmDtp.endTime', v => {
			range.end = v;
			this.getConf();
		}, true);
	}

	getConf(){
		// let moment = this.Moment;
		let methods = this.methods;
		
		this.format = this.Scope.format ? this.Scope.format : "YYYY-MM-DD HH:mm:ss";
		this.formatVal = methods.getFormatVal(this.startTime, this.endTime);
	}

	setToolMethods() {
		let vm = this;
		let moment = this.Moment;
		this.methods = {
			getFormatVal(start, end, format = vm.format){
				let formatStr = '', startStr = '', endStr = '';
				if(start != undefined){
					startStr = start.format(format);
				}
				if(end != undefined){
					endStr = end.format(format);
				}

				if(startStr.length > 0 && endStr.length > 0){
					formatStr = `${startStr} - ${endStr}`;
				}

				return formatStr;
			},
			formatMoment(m){
				let standardMoment = moment();

				if(angular.isNumber(m)){
					// 对象是时间戳
					standardMoment = moment(m);
				} else if(m == undefined){
					// 对象是无定义
					standardMoment = null;
				} else{
					standardMoment = m;
				}
				return standardMoment;
			}
		}
	}

	setViewMethods(){
		let vm = this;
		this.selectingTime = false;
		this.viewMethods = {
			openPanel(panel){
				if(panel == 'time'){
					vm.selectingTime = true;	
				}else {
					vm.selectingTime = false;
				}
				
			},
			toggleRangePanel(status){
				vm.panelStatus = status;
			},
			// 选择结束
			donePick(){
				vm.panelStatus = false;
			},
			// 清空选择
			clearPick(){
				vm.startTime = null;
				vm.endTime = null;
			}
		}
	}
}