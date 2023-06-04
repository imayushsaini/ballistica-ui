/* eslint-disable no-prototype-builtins */
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-role-management",
  templateUrl: "./role-management.component.html",
  styleUrls: ["./role-management.component.scss"],
})
export class RoleManagementComponent implements OnInit {
  ROLES = {
    owner: {
      tag: "\\cowner\\c",
      ids: ["pb-sdf", "pb-32f"],
      commands: ["sm", "nv"],
    },
    vip: {
      tag: "vip",
      ids: ["4rwer", "34rwer"],
      commands: ["kick", "changetag"],
    },
  };
  constructor(private formBuilder: FormBuilder) {}

  formGroup: FormGroup = this.formBuilder.group({});
  showCreateNewRoleComponent = false;
  newRoleName!: string;
  invalidNewRoleName = false;
  modified = false;

  ngOnInit() {
    this.formGroup = this.generateFormStructure(this.ROLES);
    console.log(this.formGroup);
    this.detectChanges();
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

  formArrayToCommaSeparatedString(name: string, controlName: string) {
    const values = (this.formGroup.get(controlName) as FormGroup).value[name];
    return values.join(",");
  }
  commaSeparatedStringToFormArray(
    event: any,
    controlName: string,
    name: string
  ) {
    const value = event.target.value;
    const newValues = value.split(",").map((item: string) => item.trim());
    console.log(newValues);
    (this.formGroup.get(controlName) as FormGroup).setControl(
      name,
      this.formBuilder.array(newValues)
    );
  }

  detectChanges() {
    // Fires on each form control value change
    this.formGroup.valueChanges.subscribe(() => {
      // Variable res holds the current value of the form
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
  }

  onCreateRole() {
    if (Object.keys(this.formGroup.controls).includes(this.newRoleName)) {
      this.invalidNewRoleName = true;
      alert(`role "${this.newRoleName}" already exists`);
    } else {
      this.showCreateNewRoleComponent = false;
      const formGroup = this.generateFormStructure({
        tag: this.newRoleName,
        commands: [],
        ids: [],
        tagcolor: [1, 1, 1],
      });
      this.formGroup.addControl(this.newRoleName, formGroup);
    }
  }
  onSave() {
    console.log(JSON.stringify(this.formGroup.value));
    this.modified = false;
  }
}
