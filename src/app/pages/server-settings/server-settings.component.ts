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
import { MatSnackBar } from "@angular/material/snack-bar";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-server-settings",
  templateUrl: "./server-settings.component.html",
  styleUrls: ["./server-settings.component.scss"],
  standalone: false,
})
export class ServerSettingsComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  formGroup: FormGroup = this.formBuilder.group({});
  isValid = true;
  modified = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.adminService.getSettings().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.formGroup = this.generateFormStructure(data);
        this.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Settings load error:", err);
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
    this.adminService.updateSettings(this.formGroup.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.modified = false;
        this.snackBar.open("Server settings updated successfully", "OK", {
          duration: 3000,
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          "Failed to update settings: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }
}
