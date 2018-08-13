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
            isGlobal: '=',
            minDay: '=',
            maxDay: '=',
            minView: '='
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
        const Win = this.Window;
        // 配置静态参数
        this.setStaticConf();
        // 处理初始值
        this.setConf();
        this.setViewMethods();
        this.setWatchers();
        this.CloneOutside = false;
        Win.onscroll = () => {
            this.setDynamicPanel();
        };
        Win.onresize = () => {
            this.setDynamicPanel();
        };
        this.Scope.$on('$destroy', () => {
            this.removeDynamicPanel();
        });
    }

    setStaticConf() {
        const Scope = this.Scope;
        this.format = Scope.format || 'YYYY-MM-DD HH:mm:ss';
        this.value = Scope.value;
        this.minDay = Scope.minDay;
        this.maxDay = Scope.maxDay;
        this.minView = Scope.minView || 'time';
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

    // 设置动态全局插入Panel
    setDynamicPanel(afterThat) {
        const isGlobal = this.Scope.isGlobal;
        const posAttr = this.Scope.pos;
        if (isGlobal) {
            const el = this.Element;
            const pos = this._getPickerPos(el[0]);
            const docBody = this.Document.find('body');
            let dropdown = this.Document[0].getElementById(`ng-picker-to-clone__${this.SCOPE_ID}`);
            let dropdownMask = this.Document[0].getElementById(`ng-mask-to-clone__${this.SCOPE_ID}`);
            if(dropdown && dropdownMask){
                docBody.append(dropdown);
                docBody.append(dropdownMask);
                this.CloneOutside = true;
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
            }
            afterThat && afterThat();
        }
    }

    // 销毁Panel
    removeDynamicPanel(afterThat){
        const isGlobal = this.Scope.isGlobal;
        const Timeout = this.Timeout;
        if (isGlobal && this.CloneOutside){
            const docBody = this.Document.find('body')[0];
            const dropdown = this.Document[0].getElementById(`ng-picker-to-clone__${this.SCOPE_ID}`);
            const dropdownMask = this.Document[0].getElementById(`ng-mask-to-clone__${this.SCOPE_ID}`);
            Timeout(()=>{

                if(dropdown){
                    docBody.removeChild(dropdown);
                }
                if(dropdownMask){
                    docBody.removeChild(dropdownMask);
                }
            }, 200);
        }
        afterThat && afterThat();
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
        const moment = this.Moment;
        this.viewMethods = {
            togglePicker(open) {
                if(open){
                    vmDp.setDynamicPanel(() => {
                        vmDp.Timeout(()=>{
                            vmDp.isOpened = open;
                        }, 0);
                    });
                }else{
                    vmDp.isOpened = open;
                }

            },
            selectOption(conf) {
                const { start, end } = conf;
                vmDp.value = vmDp.Scope.value = {
                    start: moment(start.valueOf()),
                    end: moment(end.valueOf())
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
