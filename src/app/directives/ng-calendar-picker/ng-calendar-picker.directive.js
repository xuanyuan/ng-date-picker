export function NgCalendarPicker() {
    'ngInject';

    let directive = {
        restrict: 'E',
        scope: {
            value: '='
        },
        controller: NgCalendarPickerController,
        controllerAs: 'vmCp',
        templateUrl: 'app/directives/ng-calendar-picker/ng-calendar-picker.html',
        link: function(scope, elem, attrs, ctrl) {
            ctrl.init();
        }
    };

    return directive;
}

class NgCalendarPickerController {
    constructor($document, $element, $scope, moment) {
        'ngInject';
        this.Document = $document;
        this.Element = $element;
        this.Scope = $scope;
        this.Moment = moment;
    }

    init() {
        this.setStaticConf();
        this.setConf();
        this.setViewMethods();
        this.setWatchers();
    }

    setStaticConf() {
        this.panel = {
            left: 'date',
            right: 'year'
        }
        this.weekConf = ['日', '一', '二', '三', '四', '五', '六'];
        this.monthConf = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        // 根据当前年进行初始配置
        const nsYear = this.Scope.value.start.year();
        const neYear = this.Scope.value.end.year();
        this.nsYearConf = this._getRangeYears(nsYear);
        this.neYearConf = this._getRangeYears(neYear);
    }

    setConf() {
        const Scope = this.Scope;
        const start = Scope.value.start;
        const end = Scope.value.end;

        this.start = {
            year: start.year(),
            month: start.month(),
            date: start.date()
        };

        this.end = {
            year: end.year(),
            month: end.month(),
            date: end.date()
        };
    }

    setWatchers(){
        this.Scope.$watch('value', () => {
            this.setConf();
        }, true);
    }

    setViewMethods() {
        const vmCp = this;
        this.viewMethods = {
            selectPanel(which, name) {
                vmCp.panel[which] = name;
            },
            selectMonth(which, index) {
                vmCp.Scope.value[which].month(index);
                vmCp.setConf();
            },
            selectYear(which, index) {
                vmCp.Scope.value[which].year(index);
                vmCp.setConf();
            },
            rangeYear(which, dir) {
                if (which === 'left') {
                    const pos = vmCp.nsYearConf[4];
                    if (dir === 'prev') {
                        vmCp.nsYearConf = vmCp._getRangeYears(pos - 12);
                    } else {
                        vmCp.nsYearConf = vmCp._getRangeYears(pos + 12);
                    }
                } else {
                    const pos = vmCp.neYearConf[4];
                    if (dir === 'prev') {
                        vmCp.neYearConf = vmCp._getRangeYears(pos - 12);
                    } else {
                        vmCp.neYearConf = vmCp._getRangeYears(pos + 12);
                    }
                }
            }
        };
    }

    _getRangeYears(now) {
        let serialAry = [];
        for (let i = now - 4; i < now + 8; i++) {
            serialAry.push(i);
        }
        return serialAry;
    }

    _getRangeDates(now){
        let cells = [];
        let gridNum = 42;
        let monthStart = now.startOf('month');
        let monthEnd = now.endOf('month');
        let firstDay = monthStart.day();
        for(let i = 0; i < gridNum; i++){
            let date = {};
            if(d <= 6 && d < firstDay){
                
            }
        }

    }
}
