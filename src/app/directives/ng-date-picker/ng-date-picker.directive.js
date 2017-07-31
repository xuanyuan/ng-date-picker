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
    constructor($window, $document, $element, $scope, $timeout, moment) {
        'ngInject';
        this.Window = $window;
        this.Document = $document;
        this.Element = $element;
        this.Scope = $scope;
        this.Timeout = $timeout;
        this.Moment = moment;
    }

    init() {
        const Timeout = this.Timeout;
        this.setStaticConf();
        this.setConf();
        this.setViewMethods();
        this.setWatchers();
        Timeout(()=>{
            this.setDynamicPanel();
        }, 0);
    }

    // 设置动态全局插入Panel
    setDynamicPanel(afterThat) {
        const isGlobal = this.Scope.isGlobal;
        const posAttr = this.Scope.pos;
        if (isGlobal === true) {
            const el = this.Element;
            const pos = this._getPickerPos(el[0]);
            const docBody = this.Document.find('body');
            const dropdown = this.Document[0].getElementById(`ng-picker-to-clone__${this.SCOPE_ID}`);
            const dropdownMask = this.Document[0].getElementById(`ng-mask-to-clone__${this.SCOPE_ID}`);
            docBody.append(dropdown);
            docBody.append(dropdownMask);
            const [inputWidth, inputHeight, panelWidth] = [pos.width, pos.height, 530];
            const [baseLeft, baseTop] = [pos.left, pos.top];
            const marginTop = 4;

            dropdown.style.top = `${baseTop}px`;
            switch(posAttr){
                case 'center':
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)/2}px`;
                    break;
                case 'right':
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)}px`;
                    break;
                case 'cover':
                case 'cover-left':
                    dropdown.style.top = `${baseTop - inputHeight - marginTop}px`;
                    dropdown.style.left = `${baseLeft}px`;
                    break;
                case 'cover-center':
                    dropdown.style.top = `${baseTop - inputHeight - marginTop}px`;
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)/2}px`;
                    break;
                case 'cover-right':
                    dropdown.style.top = `${baseTop - inputHeight - marginTop}px`;
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)}px`;
                    break;
                default:
                    dropdown.style.left = `${baseLeft}px`;
                    break;
            }
            afterThat && afterThat();
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
        this.SCOPE_ID = Math.round(Math.random()*1e9);
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
            this.Scope.onChange({
                value: {
                    start: v.start.valueOf(),
                    end: v.end.valueOf()
                }
            });
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
                vmDp.setDynamicPanel(() => {
                    vmDp.Timeout(()=>{
                        vmDp.isOpened = open;
                    }, 0);
                });
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
                const v = vmDp.Scope.value;
                vmDp.Scope.onOk({
                    value: {
                        start: v.start.valueOf(),
                        end: v.end.valueOf()
                    }
                });
                this.togglePicker(false);
            }
        }
    }

    _getPickerPos(target){
        const rect = target.getBoundingClientRect();
        const ww = this.Window.innerWidth;
        
        return {
            top: rect.top + rect.height,
            right: ww - (rect.left + rect.width),
            left: rect.left,
            width: rect.width,
            height: rect.height
        };
    }
}
