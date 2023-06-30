/* eslint-disable no-prototype-builtins */
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-server-config",
  templateUrl: "./server-config.component.html",
  styleUrls: ["./server-config.component.scss"],
})
export class ServerConfigComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService
  ) {}

  formGroup: FormGroup = this.formBuilder.group({});
  isValid = true;
  modified = false;
  isLoading = true;
  ngOnInit() {
    this.adminService.getConfig().subscribe((data) => {
      // Generate the form structure
      this.formGroup = this.generateFormStructure(data);
      this.isLoading = false;
      this.detectChanges();
    });
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
        return Validators.pattern(/^\d+(\.\d+)?$/);
      default:
        return Validators.nullValidator;
    }
  }

  detectChanges() {
    // Fires on each form control value change
    this.formGroup.valueChanges.subscribe(() => {
      // Variable res holds the current value of the form
      this.modified = true;
      this.isValid =
        this.findInvalidControlsRecursive(this.formGroup).length == 0;
    });
  }

  public findInvalidControlsRecursive(
    formToInvestigate: FormGroup | FormArray
  ): string[] {
    // eslint-disable-next-line prefer-const
    let invalidControls: string[] = [];
    // eslint-disable-next-line prefer-const
    let recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (control?.invalid) invalidControls.push(field);
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }

  onSubmit() {
    this.modified = false;

    this.adminService
      .updateConfig(this.verifyConfig(this.formGroup.value))
      .subscribe(() => {
        console.log("updated");
      });
  }
  verifyConfig(config: any) {
    config["team_colors"] = config["team_colors"].map(
      (teamCol: string | string[] | number[]) => {
        return typeof teamCol === "string"
          ? this.getSafeColor(teamCol.split(","))
          : this.getSafeColor(teamCol);
      }
    );
    return config;
  }

  getSafeColor(list: number[] | string[]) {
    if (list.length != 3) return [1, 1, 1];
    else {
      const result = list.map((element) => {
        const converted = Number(element);
        return isNaN(converted) ? 1 : converted;
      });
      return result;
    }
  }
}
