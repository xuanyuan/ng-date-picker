export function NgCalendarPicker() {
    'ngInject';

    let directive = {
        restrict: 'E',
        scope: {
            value: '=',
            minDay: '=',
            maxDay: '='
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
        this.hasVal = !(this.Scope.value.start == '' || this.Scope.value.end == '');
        this.setStaticConf();
        this.setConf();
        this.setViewMethods();
        this.setWatchers();
    }

    setStaticConf() {
        this.panel = {
            left: 'date',
            right: 'date'
        }
        this.weekConf = ['日', '一', '二', '三', '四', '五', '六'];
        this.monthConf = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        // 根据当前年进行初始配置
        this.minDay = this.Scope.minDay;
        this.maxDay = this.Scope.maxDay;
    }

    setConf() {
        const moment = this.Moment;
        const Scope = this.Scope;
        const start = Scope.value.start;
        const end = Scope.value.end;
        this.hasVal = !(start == '' || end == '');

        if (this.hasVal) {
            this.start = {
                start,
                year: start.year(),
                month: start.month(),
                date: start.date(),
                hour: start.hour(),
                minute: start.minute(),
                second: start.second()
            };

            this.end = {
                end,
                year: end.year(),
                month: end.month(),
                date: end.date(),
                hour: start.hour(),
                minute: start.minute(),
                second: start.second()
            };
        } else {
            const m = moment();
            this.start = this.end = {
                year: m.year(),
                month: m.month(),
                date: m.date(),
                hour: start.hour(),
                minute: start.minute(),
                second: start.second(),
                disabled: true
            }
        }

        this.dateConf = {
            left: this._getRangeDates(this.start),
            right: this._getRangeDates(this.end)
        };

        this.nsYearConf = this._getRangeYears(this.start.year);
        this.neYearConf = this._getRangeYears(this.end.year);
        this.nsMonthConf = this._getRangeMonths(this.start);
        this.neMonthConf = this._getRangeMonths(this.end);
    }

    setWatchers() {
        this.Scope.$watch('value', v => {
            // 左值永远小于等于右值，否则交替
            if (v.start.valueOf() >= v.end.valueOf()) {
                [this.Scope.value.start, this.Scope.value.end] = [this.Scope.value.end, this.Scope.value.start];
            }
            this.setConf();
        }, true);
    }

    setViewMethods() {
        const moment = this.Moment;
        const vmCp = this;

        // 倘若无值，则点击时自动选当前日期
        function autoValue(){
            if(!vmCp.hasVal){
                vmCp.Scope.value.start = moment();
                vmCp.Scope.value.end = moment();
            }
        }
        this.viewMethods = {
            selectPanel(which, name) {
                vmCp.panel[which] = name;
            },
            selectDate(which, d) {
                autoValue();
                // 当前月
                if (d.at && !d.limited) {
                    vmCp.Scope.value[which].date(d.n);
                    // 若在单个日历范围内已经选择值，则有可能是用户在单个日历中选择范围
                    vmCp.dateConf = {
                        left: vmCp._getRangeDates(vmCp.start),
                        right: vmCp._getRangeDates(vmCp.end)
                    };
                }
            },
            selectMonth(which, index, m) {
                if(m.monthLimited){
                    return;
                }
                autoValue();
                // 假如超出限制
                const _d = vmCp.Scope.value[which].month(index);
                if(_d.valueOf() <= vmCp.minDay.valueOf()) vmCp.Scope.value[which].month(index).date(vmCp.minDay.date() + 1);
                if(_d.valueOf() >= vmCp.maxDay.valueOf()) vmCp.Scope.value[which].month(index).date(vmCp.maxDay.date());
                vmCp.setConf();
                vmCp.panel[which === 'start' ? 'left' : 'right'] = 'date';
            },
            selectYear(which, y) {
                if(y.yearLimited){
                    return;
                }
                autoValue();
                vmCp.Scope.value[which].year(y.i);
                vmCp.setConf();
                vmCp.panel[which === 'start' ? 'left' : 'right'] = 'month';
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
        const vmCp = this;
        const bYear = vmCp.minDay.year();
        const eYear = vmCp.maxDay.year();
        let yearSet = [];
        for (let i = now - 4; i < now + 8; i++) {
            const yearLimited = (() => {
                if(i >= bYear && i <= eYear){
                    return false;
                } else {
                    return true;
                }
            })();
            yearSet.push({
                i, yearLimited
            });
        }
        return yearSet;
    }

    _getRangeMonths(now){
        const vmCp = this;
        const bMonth = vmCp.minDay.month();
        const eMonth = vmCp.maxDay.month();
        const iYear = now.year;
        const bYear = vmCp.minDay.year();
        const eYear = vmCp.maxDay.year();
        let monthSet = [];
        let monthConf = this.monthConf;
        console.log(bMonth, eMonth, iYear, bYear, eYear);
        for(let i = 0; i < monthConf.length; i++){
            const monthLimited = (() => {
                if(iYear > bYear && iYear < eYear){
                    return false;
                } else if ((iYear === bYear && i >= bMonth) || (iYear === eYear && i <= eMonth)){
                    if(!(bYear === eYear && (i >= bMonth && i <= eMonth))){
                        return true;
                    }
                    return false;
                } else {
                    return true;
                }
            })();
            monthSet.push({
                i: monthConf[i],
                monthLimited
            })
        }
        return monthSet;
    }

    _getRangeDates(now) {
        const vmCp = this;
        const moment = this.Moment;
        const cells = [];
        const gridNum = 42;
        const atStart = moment([now.year, now.month]);
        const atEnd = moment(atStart).endOf('month');
        const prevStart = moment([now.year, now.month - 1]);
        const prevEnd = moment(prevStart).endOf('month');

        // 生成42个网格所需要对应的信息
        const base = {
            at: {
                atStart,
                atEnd,
                atEndDate: atEnd.date(),
                atStartDay: atStart.day(),
                atEndDay: atEnd.day()
            },
            prev: {
                prevStart,
                prevEnd,
                prevEndDate: prevEnd.date(),
                prevStartDay: prevStart.day(),
                prevEndDay: prevEnd.day()
            }
        };

        let selectedCnt = 0;
        for (let d = 0, atD = 1, nextD = 1; d < gridNum; d++) {
            if (d < base.at.atStartDay) {
                // 上一个月
                const n = base.prev.prevEndDate - (base.at.atStartDay - d) + 1;
                cells.push({
                    prev: true,
                    n
                });
            } else if (d > (base.at.atEndDate + base.at.atStartDay - 1)) {
                // 下一个月
                cells.push({
                    next: true,
                    n: nextD++
                });
            } else {
                // 当前月
                const _atD = atD++;
                // 是否在限制范围内
                const _now = moment([now.year, now.month, now.date, now.hour, now.minute, now.second]).date(_atD).valueOf();
                const limited = (() => {
                    if(_now < vmCp.minDay.valueOf() || _now > vmCp.maxDay.valueOf()){
                        return true;
                    } else {
                        return false;
                    }
                })();

                if (vmCp.hasVal) {
                    // 选择值
                    const selected = (() => {
                        if ((now.year === vmCp.start.year && now.month === vmCp.start.month && _atD === vmCp.start.date) || (now.year === vmCp.end.year && now.month === vmCp.end.month && _atD === vmCp.end.date)) {
                            selectedCnt++;
                            return true;
                        } else {
                            return false;
                        }
                    })();
                    // 视觉上禁止，如左面板只能选择左值
                    const forbidden = (() => {
                        const sign = Object.keys(now)[0];
                        return selected && ((sign === 'start' && selectedCnt !== 1) || (sign === 'end' && selectedCnt !== 2));
                    })();
                    // 日期在范围之中
                    const inRange = (() => {
                        const [_start, _end] = [vmCp.Scope.value.start, vmCp.Scope.value.end];
                        const [from, to] = [
                            moment([_start.year(), _start.month(), _start.date()]).endOf('day').valueOf(),
                            moment([_end.year(), _end.month(), _end.date()]).startOf('day').valueOf()
                        ];
                        return _now > from && _now < to;
                    })();

                    cells.push({
                        at: true,
                        n: _atD,
                        selected,
                        forbidden,
                        inRange,
                        limited
                    });
                } else {
                    cells.push({
                        at: true,
                        n: _atD,
                        limited
                    });
                }
            }
        }
        // 如单个面板只存在一个值，取消禁止
        if (selectedCnt === 1) {
            cells.forEach(cell => {
                cell.forbidden = false;
            });
        }

        return cells;
    }
}
