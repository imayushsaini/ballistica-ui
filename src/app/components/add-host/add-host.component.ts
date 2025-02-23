import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DialogData {
  ip: string;
  port: string;
}

@Component({
  selector: 'app-add-host',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './add-host.component.html',
  styleUrl: './add-host.component.scss',
})
export class AddHostComponent implements OnInit {
  addHostForm!: FormGroup;
  addProxyForm!: FormGroup;
  ip: string | undefined;
  port: string | undefined;
  readonly mode = inject<string>(MAT_DIALOG_DATA);
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddHostComponent>
  ) {}

  ngOnInit(): void {
    this.addHostForm = this.fb.group({
      ip: [
        '',
        [Validators.required, Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)],
      ],
      port: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });
    this.addProxyForm = this.fb.group({
      proxy: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^https:\/\/[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(\/[^\s]*)?$/
          ),
        ],
      ],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(): void {
    if (this.mode == 'host' && this.addHostForm.valid) {
      this.dialogRef.close(this.addHostForm.value);
    }
    if (this.mode == 'proxy' && this.addProxyForm.valid) {
      this.dialogRef.close(this.addProxyForm.value.proxy);
    }
  }
}
