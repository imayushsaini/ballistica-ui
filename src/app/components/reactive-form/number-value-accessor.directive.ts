/* eslint-disable @typescript-eslint/ban-types */
import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Directive({
  selector: "[appNumberValueAccessor]",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AppNumberValueAccessorDirective,
      multi: true,
    },
  ],
})
export class AppNumberValueAccessorDirective implements ControlValueAccessor {
  private onChange!: Function;
  private onTouched!: Function;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  writeValue(value: any): void {
    this.renderer.setProperty(this.elementRef.nativeElement, "value", value);
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  @HostListener("input", ["$event.target.value"])
  onInput(value: any): void {
    this.onChange(parseFloat(value));
  }

  @HostListener("blur")
  onBlur(): void {
    this.onTouched();
  }
}
