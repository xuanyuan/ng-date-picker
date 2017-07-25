export function NgDatePicker() {
    'ngInject';

    let directive = {
        restrict: 'E',
        scope: {
            value: '=',
            format: '@',
            placeholder: '@',
            options: '=',
            clearable: '=',
            readonly: '='
        },
        controller: NgDatePickerController,
        controllerAs: 'vmDp',
        templateUrl: 'app/directives/ng-date-picker/ng-date-picker.html',
        link: (scope, elem, attrs, ctrl) => {
            ctrl.init();
        }
    };

    return directive;
}

class NgDatePickerController {
    constructor($element, $scope, $filter, moment) {
        'ngInject';
        this.Element = $element;
        this.Scope = $scope;
        this.Filter = $filter;
        this.Moment = moment;
    }

    init() {
        this.setStaticConf();
        this.setConf();
        this.setViewMethods();
        this.setWatchers();
    }

    setStaticConf() {
        const Scope = this.Scope;
        this.format = Scope.format;
        this.value = Scope.value;
        this.options = Scope.options;
        this.placeholder = Scope.placeholder;
        this.formatVal = '';
        this.isOpened = false;
    }

    setConf(){
        this.views = 'calendar';
        // 如果左值大于右值，则应该进行交换
        const start = this.Scope.value.start.valueOf();
        const end = this.Scope.value.end.valueOf();
        if(start > end){
            [this.Scope.value.start, this.Scope.value.end] = [this.Scope.value.end, this.Scope.value.start];
        }
    }

    setWatchers(){
        const moment = this.Moment;
        this.Scope.$watch('value',v => {
            if(v.start == '' && v.end != ''){
                v.start = moment(v.end).hour(0).minute(0).second(0);
            }
            if(v.start != '' && v.end == ''){
                v.end = moment(v.start).hour(0).minute(0).second(0);
            }
            this.setFormatVal(v.start, v.end, this.format);
        }, true);
    }

    setFormatVal(start, end, format){
        let formatStr = '';
        if(start == '' || end == ''){
            formatStr = '';
        } else {
            formatStr = `${start.format(format)} - ${end.format(format)}`;          
        }
        this.formatVal = formatStr;
    }

    setViewMethods() {
        const vmDp = this;
        this.viewMethods = {
            togglePicker(open){
                vmDp.isOpened = open;
            },
            selectOption(conf) {
                const { start, end } = conf;
                vmDp.value = vmDp.Scope.value = {
                    start, end
                };
                vmDp.setConf();
            },
            selectView(which){
                vmDp.views = which;
            },
            clearValue(){
                vmDp.Scope.value = vmDp.value = {
                    start: '',
                    end: ''
                };
            },
            doneValue(){
                this.togglePicker(false);
            }
        }
    }
}
