export function NgTimePicker() {
    'ngInject';

    let directive = {
        restrict: 'E',
        scope: {
            value: '='
        },
        controller: NgTimePickerController,
        controllerAs: 'vmTp',
        templateUrl: 'app/directives/ng-time-picker/ng-time-picker.html',
        link: function(scope, elem, attrs, ctrl) {
            ctrl.init();
        }
    };

    return directive;
}

class NgTimePickerController {
    constructor($document, $element, $scope, moment) {
        'ngInject';
        this.Document = $document;
        this.Element = $element;
        this.Scope = $scope;
        this.Moment = moment;
    }

    init() {
        this.setStaticConf();
        this.setViewDisplay();
        this.setViewMethods();
        this.setWatchers()
    }

    setStaticConf() {
        // 时分秒配置
        this.hourConf = this._getSerialNums(0, 24);
        this.minConf = this._getSerialNums(0, 60);
        this.secConf = this._getSerialNums(0, 60);
    }

    setWatchers() {
        this.Scope.$watch('value', v => {
            this.setViewDisplay();
        });
    }

    setViewDisplay() {
        const value = this.Scope.value;
        this.yearNow = value.year();
        this.monthNow = value.month();
        this.hrNow = value.hours();
        this.minNow = value.minutes();
        this.secNow = value.seconds();
    }

    setViewMethods() {
        const vmTp = this;
        this.viewMethods = {
            selectTime(which, index) {
                let date;
                let value = vmTp.Scope.value;
                switch (which) {
                    case 'h':
                        date = value.hour(index);
                        break;
                    case 'm':
                        date = value.minute(index);
                        break;
                    case 's':
                        date = value.second(index);
                        break;
                }
                vmTp.Scope.value = date;
                vmTp.setViewDisplay();
            }
        };
    }

    _getSerialNums(begin = 0, end = 0, fillZero = true) {
        let serialSet = [],
            mem = '';
        for (let i = begin; i < end; i++) {
            mem = String(i);
            if (fillZero) {
                serialSet.push(mem.length > 1 ? mem : ('0' + mem));
            } else {
                serialSet.push(mem);
            }
        }
        return serialSet;
    }
}
