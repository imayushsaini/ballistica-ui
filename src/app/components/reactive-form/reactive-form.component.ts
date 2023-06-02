import { Component, Input } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-reactive-form",
  templateUrl: "./reactive-form.component.html",
  styleUrls: ["./reactive-form.component.scss"],
})
export class ReactiveFormComponent {
  @Input()
  formGroup!: FormGroup;

  getFormControls(formGroup: FormGroup): string[] {
    return Object.keys(formGroup.controls);
  }

  getControlType(control: FormControl | FormGroup): string {
    if (control instanceof FormGroup) {
      return "group";
    }

    if (control instanceof FormArray) {
      return "array";
    }

    return "control";
  }

  getValueType(control: FormControl): string {
    return typeof control?.value;
  }

  getFormArrayControls(formArray: FormArray): string[] {
    return formArray.controls.map(
      (control: any, index: { toString: () => any }) => index.toString()
    );
  }

  hasError(control: FormControl): boolean {
    return control.invalid;
  }
}
