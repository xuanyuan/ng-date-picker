export function NgCalendarPicker() {
	'ngInject';

	let directive = {
		restrict: 'E',
		scope: {
			dateVars: '=',
			operation: '=',
			activateTime: '='
		},
		controller: NgCalendarPickerController,
		templateUrl: 'app/directives/ng-calendar-picker/ng-calendar-picker.html',
		controllerAs: 'vmCp',
		link: (scope, elem, attrs, ctrl) => {
			ctrl.init();
		}
	}

	return directive;
}

class NgCalendarPickerController {
	constructor($document, $element, $scope, moment, $filter, $log) {
		'ngInject';
		this.Document = $document;
		this.Element = $element;
		this.Scope = $scope;
		this.Moment = moment;
		this.Filter = $filter;
		this.Log = $log;
	}

	init() {
		// 选中的日期
		this.selectedDate = {};
		this.panel = 'date-panel';
		this.setToolMethods();
		this.setViewMethods();
		this.getStaticConf();
		this.getConf();

		this.Scope.$watch('activateTime', v => {
			this.panel = (v === true ? 'time-panel' : 'date-panel');
		});

		this.Scope.$watch('dateVars', () => {
			this.getConf();
		})
	}

	// 静态不会变化的配置
	getStaticConf(){
		let methods = this.methods;
		// 分别对应：0 1 2 3 4 5 6，星期配置
		this.weekConf = ['日', '一', '二', '三', '四', '五', '六'];
		// 月份配置
		this.monthConf = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
		// 时分秒配置
		this.hourConf = methods.getSerialAry(0, 24);
		this.minConf = methods.getSerialAry(0, 60);
		this.secConf = methods.getSerialAry(0, 60);
	}	

	// 动态配置
	getConf() {
		let methods = this.methods;
		let moment = this.Moment;
		let dateVars = this.Scope.dateVars;
		let _dateVars = dateVars;
		if(dateVars == undefined){
			_dateVars = moment();
		}
		let aY = _dateVars.year();
		let aM = _dateVars.month();
		let aD = _dateVars.date();
		let ah = _dateVars.hours();
		let am = _dateVars.minute();
		let as = _dateVars.second();
		let hms = [ah, am, as];

		this.dateConf = [];
		this.yearNow = dateVars == undefined ? -1 : aY;
		this.monthNow = dateVars == undefined ? -1 : aM;
		this.hourNow = dateVars == undefined ? -1 : ah;
		this.minNow = dateVars == undefined ? -1 : am;
		this.secNow = dateVars == undefined ? -1 : as;

		// 每个月42个网格
		let cells = 42;
		let conf = [];
		let md = methods.getMonthDateRange(aY, aM);
		// 当前月的开始工作日（周几）
		let begin = md.asd.day();
		// 当前月的结束日期（几号）
		let end = md.aed.date();
		// 上一个月的结束日期（几号）
		let prevCnt = md.ped.date();

		// 日期配置
		let dayCnt = 1;
		let nextCnt = 1;
		for (let d = 0; d < cells; d++) {
			let od = {};
			let date = 0;

			if (d <= 6 && d < begin) {
				// 上一个月
				date = prevCnt - begin + d + 1;
				od = {
					prev: true,
					date: moment([aY, aM - 1, date].concat(hms)),
					num: date
				};
			} else if (d > 6 && d > (end + begin - 1)) {
				// 下一个月
				date = nextCnt;
				let nextMonth = aM;
				let _year = aY;
				if(aM >= 11){
					_year++;
					nextMonth = 0;
				} else {
					nextMonth++;
				}
				od = {
					next: true,
					date: moment([_year, nextMonth, date].concat(hms)),
					num: date
				};
				nextCnt++;
			} else {
				// 当前月
				date = dayCnt;
				od = {
					active: true,
					date: moment([aY, aM, date].concat(hms)),
					num: date
				};
				dayCnt++;
			}

			conf.push(od);
		}
		this.dateConf = conf;

		// 年份配置
		this.yearConf = [];
		let _yearNow = this.Filter('timeNow')(this.yearNow, 'year');
		for(let i = _yearNow - 4; i < _yearNow + 8; i++){
			this.yearConf.push(i);
		}

		// 在视图中显示当前激活日期
		this.selectedDate = {
			date: dateVars,
			index: dateVars == undefined ? -1 : (aD + begin - 1)
		}
	}

	// 组件内部工具方法
	setToolMethods() {
		let moment = this.Moment;
		this.methods = {
			getMonthDateRange,
			getSerialAry
		};

		// 获取当月与前月的终始日期
		function getMonthDateRange(year, month) {
			let activeStartDate = moment([year, month]);
			let activeEndDate = moment(activeStartDate).endOf('month');
			let prevStartDate = moment([year, month - 1]);
			let prevEndDate = moment(prevStartDate).endOf('month');
			return {
				asd: activeStartDate,
				aed: activeEndDate,
				psd: prevStartDate,
				ped: prevEndDate
			};
		}

		// 生成序列
		function getSerialAry(begin = 0, end = 0, fillZero = true){
			let ary = [], temp = '';
			for(let i = begin; i < end; i++){
				temp = String(i);
				if(fillZero){
					ary.push(temp.length > 1? temp : ('0' + temp));
				}else{
					ary.push(temp);
				}
			}
			return ary;
		}
	}

	// 组件视图全局方法
	setViewMethods() {
		let vm = this;
		let moment = this.Moment;
		this.viewMethods = {
			selectDate(d, index) {
				if(!d.active) return;
				let date = d.date;
				vm.selectedDate = {
					date, index
				};
				vm.Scope.dateVars = date;
			},
			selectMonth(m){
				let dateVars = vm.Scope.dateVars;
				if(dateVars == undefined){
					dateVars = moment();
				}
				let month = parseInt(m) - 1;
				let originDateVars = dateVars;
				let date = originDateVars.month(month);
				vm.selectedDate.date = date;
				vm.Scope.dateVars = date;
				vm.getConf();
				vm.panel = 'date-panel';
			},
			selectYear(y){
				let dateVars = vm.Scope.dateVars;
				if(dateVars == undefined){
					dateVars = moment();
				}
				let date = dateVars.year(y);
				vm.selectedDate.date = date;
				vm.Scope.dateVars = date;
				vm.getConf();
				vm.panel = 'month-panel';
			},
			selectTime(which, index){
				let date;
				let vars = vm.Scope.dateVars;
				switch(which){
					case 'h':
						date = vars.hour(index);
						break;
					case 'm':
						date = vars.minute(index);
						break;
					case 's':
						date = vars.second(index);
						break;
				}
				vm.selectedDate.date = date;
				vm.Scope.dateVars = date;
				vm.getConf();
			},
			// 年份选择日期往前后推12格
			jumpRangeYears(dir){
				let yFirst = vm.yearConf[0];
				let yFinal = vm.yearConf[11];
				let newYearConf = [];
				if(dir > 0){
					for(let i = yFinal + 1; i <= yFinal + 12; i++){
						newYearConf.push(i);
					}
				} else {
					for(let i = yFirst - 12; i < yFirst; i++){
						newYearConf.push(i);
					}
				}
				vm.yearConf = newYearConf;

			},
			showPanel(name){
				vm.panel = name;
			},
			// 选择结束
			donePick(){

			},
			// 清空选择
			clearPick(){

			}
		};
	}
}