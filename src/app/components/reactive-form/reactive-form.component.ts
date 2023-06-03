import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { Component, Input } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
@Component({
  selector: "app-reactive-form",
  templateUrl: "./reactive-form.component.html",
  styleUrls: ["./reactive-form.component.scss"],
  animations: [
    trigger("slide", [
      state("void", style({ transform: "translateY(-20%)", opacity: 0 })),
      state("*", style({ transform: "translateY(0%)", opacity: 1 })),
      transition("void => *", animate("100ms")),
      transition("* => void", animate("100ms")),
    ]),
  ],
})
export class ReactiveFormComponent {
  @Input()
  formGroup!: FormGroup;
  controlExpendMap: Map<string, boolean> = new Map<string, boolean>();

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
  valueTypeNumber(control: FormControl): boolean {
    return typeof control?.value === "number";
  }
  valueTypeBoolean(control: FormControl): boolean {
    return typeof control?.value === "boolean";
  }

  getFormArrayControls(formArray: FormArray): string[] {
    return formArray.controls.map(
      (control: any, index: { toString: () => any }) => index.toString()
    );
  }

  hasError(control: FormControl): boolean {
    return control.invalid;
  }

  onExpandToogle(controlName: string) {
    if (this.controlExpendMap.has(controlName)) {
      this.controlExpendMap.set(
        controlName,
        !this.controlExpendMap.get(controlName)
      );
    } else this.controlExpendMap.set(controlName, true);
  }

  isExpended(controlName: string): boolean {
    return (
      this.controlExpendMap.has(controlName) &&
      this.controlExpendMap.get(controlName) == true
    );
  }
}
