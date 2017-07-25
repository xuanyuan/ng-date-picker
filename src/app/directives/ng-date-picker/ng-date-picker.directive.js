export function NgDatePicker() {
    'ngInject';

    let directive = {
        restrict: 'E',
        scope: {
            type: '@',
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
        this.Scope.$watch('value',v => {
            this.setFormatVal(v.start, v.end, this.format);
        }, true);
    }

    setFormatVal(start, end, format){
        this.formatVal = `${start.format(format)} - ${end.format(format)}`;
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

            },
            doneValue(){

            }
        }
    }
}
