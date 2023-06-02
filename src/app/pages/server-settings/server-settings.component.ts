/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-server-settings",
  templateUrl: "./server-settings.component.html",
  styleUrls: ["./server-settings.component.scss"],
})
export class ServerSettingsComponent implements OnInit {
  constructor(private formBuilder: FormBuilder) {}

  formGroup: FormGroup = this.formBuilder.group({ name: "hey" });
  ngOnInit() {
    const jsonData = {
      name: "smoothy",
      discord: { enabled: true, token: "hey", names: ["hey hello", "bro"] },
      hobbies: ["coding", "gaming", "reading"],
      quickTurn: {
        enable: true,
        quantity: 2,
        highlights: { color: "red", random: true },
      },
    };

    // Generate the form structure
    this.formGroup = this.generateFormStructure(jsonData);
  }

  generateFormStructure(data: any): FormGroup {
    const formGroup = this.formBuilder.group({});

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];

        if (Array.isArray(value)) {
          const formArray = this.formBuilder.array([]);

          value.forEach((arrayItem: any) => {
            formArray.push(this.formBuilder.control(arrayItem));
          });

          formGroup.addControl(key, formArray);
        } else if (typeof value === "object" && value !== null) {
          formGroup.addControl(key, this.generateFormStructure(value));
        } else {
          formGroup.addControl(
            key,
            this.formBuilder.control(value, this.getValidator(value))
          );
        }
      }
    }
    return formGroup;
  }
  getFormControls(formGroup: FormGroup | any): string[] {
    console.log(formGroup);
    return Object.keys(formGroup.controls);
  }

  getControlType(control: FormControl | FormGroup | any): string {
    if (control instanceof FormGroup) {
      return "group";
    }

    if (control instanceof FormArray) {
      return "array";
    }

    return "control";
  }

  getFormArrayControls(formArray: FormArray | any): string[] {
    return formArray.controls.map(
      (control: any, index: { toString: () => any }) => index.toString()
    );
  }

  getValidator(value: any) {
    const type = typeof value;
    switch (type) {
      case "string":
        return Validators.required;
      case "number":
        return Validators.pattern(/^\d+$/);
      case "boolean":
        return Validators.requiredTrue;
      default:
        return Validators.nullValidator;
    }
  }

  onSubmit() {
    console.log("submit");
    console.log(this.formGroup);
  }
}
