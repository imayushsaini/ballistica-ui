/* eslint-disable no-prototype-builtins */
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-server-config",
  templateUrl: "./server-config.component.html",
  styleUrls: ["./server-config.component.scss"],
  standalone: false,
})
export class ServerConfigComponent implements OnInit {
  formGroup: FormGroup = this.formBuilder.group({});
  isValid = true;
  modified = false;
  isLoading = true;
  isSaving = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadConfig();
  }

  loadConfig() {
    this.isLoading = true;
    this.adminService.getConfig().subscribe({
      next: (data) => {
        this.formGroup = this.generateFormStructure(data);
        this.isLoading = false;
        this.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Config fetch error:", err);
      },
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
    this.formGroup.valueChanges.subscribe(() => {
      this.modified = true;
      this.isValid =
        this.findInvalidControlsRecursive(this.formGroup).length === 0;
    });
  }

  public findInvalidControlsRecursive(
    formToInvestigate: FormGroup | FormArray
  ): string[] {
    const invalidControls: string[] = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
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
    this.isSaving = true;
    const validatedConfig = this.verifyConfig(this.formGroup.value);

    this.adminService.updateConfig(validatedConfig).subscribe({
      next: () => {
        this.isSaving = false;
        this.modified = false;
        this.snackBar.open("Engine config.json updated successfully", "OK", {
          duration: 3000,
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          "Failed to update config: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }

  verifyConfig(config: any) {
    if (config["team_colors"] && Array.isArray(config["team_colors"])) {
      config["team_colors"] = config["team_colors"].map(
        (teamCol: string | string[] | number[]) => {
          return typeof teamCol === "string"
            ? this.getSafeColor(teamCol.split(","))
            : this.getSafeColor(teamCol);
        }
      );
    }
    return config;
  }

  getSafeColor(list: number[] | string[]) {
    if (!list || list.length !== 3) return [1, 1, 1];
    return list.map((element) => {
      const converted = Number(element);
      return isNaN(converted) ? 1 : converted;
    });
  }
}
