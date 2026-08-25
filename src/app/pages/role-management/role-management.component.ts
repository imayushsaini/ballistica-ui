/* eslint-disable no-prototype-builtins */
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AdminService } from "src/app/services/admin.service";

interface Role {
  commands: string[];
  ids: string[];
  tag: string;
  tagcolor: number[];
}

interface Roles {
  [key: string]: Role;
}

@Component({
  selector: "app-role-management",
  templateUrl: "./role-management.component.html",
  styleUrls: ["./role-management.component.scss"],
  standalone: false,
})
export class RoleManagementComponent implements OnInit {
  ROLES: Roles = {};
  formGroup: FormGroup = this.formBuilder.group({});
  showCreateNewRoleComponent = false;
  newRoleName = "";
  modified = false;
  isLoading = true;
  isSaving = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.isLoading = true;
    this.adminService.getRoles().subscribe({
      next: (data) => {
        this.ROLES = (data as Roles) || {};
        this.isLoading = false;
        this.formGroup = this.generateFormStructure(this.ROLES);
        this.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Roles fetch error:", err);
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

  getFormControls(formGroup: FormGroup | any): string[] {
    return formGroup && formGroup.controls ? Object.keys(formGroup.controls) : [];
  }

  formArrayToCommaSeparatedString(name: string, controlName: string): string {
    const group = this.formGroup.get(controlName) as FormGroup;
    if (!group || !group.value) return "";
    const values = group.value[name];
    return Array.isArray(values) ? values.join(", ") : "";
  }

  commaSeparatedStringToFormArray(
    event: any,
    controlName: string,
    name: string
  ) {
    const value = event.target.value;
    const newValues = value
      .split(",")
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    const group = this.formGroup.get(controlName) as FormGroup;
    if (group) {
      group.setControl(name, this.formBuilder.array(newValues));
      this.modified = true;
    }
  }

  detectChanges() {
    this.formGroup.valueChanges.subscribe(() => {
      this.modified = true;
    });
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

  onAddRole() {
    this.showCreateNewRoleComponent = true;
    this.newRoleName = "";
  }

  onCreateRole() {
    if (!this.newRoleName || !this.newRoleName.trim()) return;
    const roleKey = this.newRoleName.trim().toLowerCase();

    if (Object.keys(this.formGroup.controls).includes(roleKey)) {
      this.snackBar.open(`Role "${roleKey}" already exists`, "OK", {
        duration: 3000,
      });
    } else {
      this.showCreateNewRoleComponent = false;
      const newRoleGroup = this.generateFormStructure({
        tag: this.newRoleName.trim(),
        commands: [],
        ids: [],
        tagcolor: [1, 1, 1],
      });
      this.formGroup.addControl(roleKey, newRoleGroup);
      this.modified = true;
      this.snackBar.open(`Created role "${roleKey}". Don't forget to save changes!`, "OK", {
        duration: 3500,
      });
    }
  }

  onDeleteRole(controlName: string) {
    if (confirm(`Are you sure you want to delete role "${controlName}"?`)) {
      this.formGroup.removeControl(controlName);
      this.modified = true;
      this.snackBar.open(`Role "${controlName}" removed. Click Save to apply.`, "OK", {
        duration: 3500,
      });
    }
  }

  onSave() {
    this.isSaving = true;
    this.adminService.saveRoles(this.formGroup.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.modified = false;
        this.snackBar.open("Roles and permissions saved successfully", "OK", {
          duration: 3000,
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          "Failed to save roles: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }
}
