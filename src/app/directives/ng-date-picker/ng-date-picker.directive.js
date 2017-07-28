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
            const docEle = this.Document[0].documentElement;
            const el = this.Element;
            const docBody = this.Document.find('body');
            const dropdown = this.Document[0].getElementById('ng-picker-to-clone');
            const PAD = 4;
            docBody.append(dropdown);
            // 先硬编码吧
            // const [clientWidth, clientHeight] = [docEle.clientWidth, docEle.clientHeight];
            const [inputWidth, inputHeight, panelWidth] = [parseInt(el.css('width')), 30, 530];
            const [baseLeft, baseTop] = [this._getElementAbsLeft(el[0]), this._getElementAbsTop(el[0])];

            dropdown.style.top = `${baseTop + inputHeight + PAD}px`;
            switch(pos){
                case 'center':
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)/2}px`;
                    break;
                case 'right':
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)}px`;
                    break;
                case 'cover':
                case 'cover-left':
                    dropdown.style.top = `${baseTop - PAD}px`;
                    dropdown.style.left = `${baseLeft}px`;
                    break;
                case 'cover-center':
                    dropdown.style.top = `${baseTop - PAD}px`;
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)/2}px`;
                    break;
                case 'cover-right':
                    dropdown.style.top = `${baseTop - PAD}px`;
                    dropdown.style.left = `${baseLeft - (panelWidth - inputWidth)}px`;
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

    _getElementAbsLeft(element){
        let actualLeft = element.offsetLeft;
        let current = element.offsetParent;
        while(current !== null){
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    }

    _getElementAbsTop(element){
        let actualTop = element.offsetTop;
        let current = element.offsetParent;
        while(current !== null){
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }
}
