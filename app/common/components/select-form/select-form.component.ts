'use strict';

import * as angular from "angular";
import * as _ from "lodash";
import {IForm} from "./form"

export class SelectFormComponentController implements ng.IComponentController {
    public availableForms:IForm[];
    public selectedForms:IForm[];
    public ngModel: any;
    public static $inject:string[] = ["$timeout"];

    constructor(private $timeout:any) {
    }

    public $onInit() {
        let ctrl:any = this;
        ctrl.$timeout(function () {
            ctrl.ngModel.$render = ctrl.onChange.bind(ctrl);
            ctrl.ngModel.$viewChangeListeners.push(ctrl.onChange.bind(ctrl));
            ctrl.addRequiredForms();
        });
    }

    addForm() {
        if (!this.canAddForm()) {
            return;
        }
        let f: IForm = {name: null, required: false};
        this.selectedForms.push(f);
    }

    canDeleteLastForm() {
        let l = this.selectedForms.length;
        return l > 0 && !this.selectedForms[l - 1].required;
    }

    canAddForm() {
        return this.selectedForms.length < this.availableForms.length;
    }

    deleteForm() {
        if (!this.canDeleteLastForm()) {
            return;
        }
        this.ngModel.$setViewValue(this.ngModel.$modelValue.slice(0, -1));
    }

    getAvailableForms(form: IForm) {
        let ctrl = this;
        return ctrl.availableForms.filter(function (f: IForm) {
            return form && f.name === form.name || angular.isArray(ctrl.selectedForms) &&
                !_.find(ctrl.selectedForms, function (selectedForm: IForm) {
                    return selectedForm.name === f.name;
                });
        });
    }

    onFormSelect() {
        let newVal: string[] = [];
        this.selectedForms.forEach(function (form: IForm) {
            if (form && form.name) {
                newVal.push(form.name);
            }
        });
        this.ngModel.$setViewValue(newVal);
    }

    addRequiredForms() {
        if (!angular.isArray(this.availableForms)) {
            return;
        }
        let requiredForms = this.availableForms.filter(function (form: IForm) {
            return form && form.required;
        }).map(function (f) {
            return f.name;
        });

        this.ngModel.$setViewValue(_.uniq(requiredForms.concat(this.ngModel.$modelValue)));
    }

    private onChange() {
        let ctrl = this;
        ctrl.selectedForms = _.map(ctrl.ngModel.$modelValue, function (formName: string) {
            return _.find(ctrl.availableForms, function (f: IForm) {
                return f.name === formName;
            });
        });
        if (ctrl.selectedForms.length === 0) {
            ctrl.selectedForms.push({name: null, required: false});
        }
    }
}

export class SelectFormComponent implements ng.IComponentOptions {
    public controller:ng.Injectable<ng.IControllerConstructor>;
    public controllerAs:string;
    public templateUrl:string;
    public bindings:any;
    public require:any;

    constructor() {
        this.controller = SelectFormComponentController;
        this.controllerAs = "$ctrl";
        this.require = {
            ngModel: 'ngModel'
        };
        this.bindings = {
            availableForms: '<'
        };
        this.templateUrl = 'app/common/components/select-form/select-form.html';
    }
}