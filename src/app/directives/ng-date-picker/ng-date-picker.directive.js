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
            readonly: '=',
            onOk: '&',
            onClear: '&',
            onChange: '&',
            isGlobal: '='
        },
        controller: NgDatePickerController,
        controllerAs: 'vmDp',
        templateUrl: 'app/directives/ng-date-picker/ng-date-picker.html',
        link: (scope, elem, attrs, ctrl) => {
            scope.pos = attrs.pos;
            ctrl.init();
        }
    };

    return directive;
}

class NgDatePickerController {
    constructor($document, $element, $scope, $filter, moment) {
        'ngInject';
        this.Document = $document;
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
        this.setDynamicPanel();
    }

    // 设置动态全局插入Panel
    setDynamicPanel() {
        const isGlobal = this.Scope.isGlobal;
        const pos = this.Scope.pos;
        if (isGlobal === true) {
            const el = this.Element;
            const docEl = this.Document.find('body');
            const dropdown = this.Document[0].getElementById('ng-picker-to-clone');
            docEl.append(dropdown);
            // 先硬编码吧
            const [baseLeft, baseTop] = [el.prop('offsetLeft'), el.prop('offsetTop')];
            const [inputWidth, inputHeight, panelWidth] = [parseInt(el.css('width')), 30, 530];

            dropdown.style.top = `${baseTop + inputHeight}px`;
            switch(pos){
                case 'center':
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)/2}px`;
                    break;
                case 'right':
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)}px`;
                    break;
                case 'cover':
                    dropdown.style.top = `${baseTop}px`;
                    dropdown.style.left = `${baseLeft}px`;
                    break;
                default:
                    dropdown.style.left = `${baseLeft}px`;
                    break;
            }
        }
    }

    setStaticConf() {
        const Scope = this.Scope;
        this.format = Scope.format || 'YYYY-MM-DD HH:mm:ss';
        this.value = Scope.value;
        this.options = Scope.options;
        this.placeholder = Scope.placeholder || '请选择日期时间范围';
        this.formatVal = '';
        this.isOpened = false;
    }

    setConf() {
        this.views = 'calendar';
        // 如果左值大于右值，则应该进行交换
        const start = this.Scope.value.start.valueOf();
        const end = this.Scope.value.end.valueOf();
        if (start > end) {
            [this.Scope.value.start, this.Scope.value.end] = [this.Scope.value.end, this.Scope.value.start];
        }
    }

    setWatchers() {
        const moment = this.Moment;
        this.Scope.$watch('value', v => {
            if (v.start == '' && v.end != '') {
                v.start = moment(v.end).hour(0).minute(0).second(0);
            }
            if (v.start != '' && v.end == '') {
                v.end = moment(v.start).hour(0).minute(0).second(0);
            }
            this.Scope.onChange();
            this.setFormatVal(v.start, v.end, this.format);
        }, true);
    }

    setFormatVal(start, end, format) {
        let formatStr = '';
        if (start == '' || end == '') {
            formatStr = '';
        } else {
            formatStr = `${start.format(format)} - ${end.format(format)}`;
        }
        this.formatVal = formatStr;
    }

    setViewMethods() {
        const vmDp = this;
        this.viewMethods = {
            togglePicker(open) {
                vmDp.isOpened = open;
            },
            selectOption(conf) {
                const { start, end } = conf;
                vmDp.value = vmDp.Scope.value = {
                    start,
                    end
                };
                vmDp.setConf();
                vmDp.isOpened = false;
            },
            selectView(which) {
                vmDp.views = which;
            },
            clearValue() {
                vmDp.Scope.onClear();
                vmDp.Scope.value = vmDp.value = {
                    start: '',
                    end: ''
                };
            },
            doneValue() {
                vmDp.Scope.onOk();
                this.togglePicker(false);
            }
        }
    }
}
