import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Like `Validators.minLength`, but whitespace-only input does not count. */
export function trimmedMinLength(min: number): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = (control.value ?? '').trim();
    return value.length > 0 && value.length < min ? { minlength: { requiredLength: min, actualLength: value.length } } : null;
  };
}

/** Required that rejects whitespace-only input. */
export function requiredTrimmed(control: AbstractControl<string>): ValidationErrors | null {
  return (control.value ?? '').trim() ? null : { required: true };
}

/** Slovak error message for the first error on a control. */
export function errorMessage(errors: ValidationErrors | null | undefined, field: string): string | null {
  if (!errors) return null;
  if (errors['server']) return errors['server'] as string;
  if (errors['required']) {
    return field === 'consent' ? 'Pre odoslanie potrebujeme váš súhlas.' : 'Toto pole je povinné.';
  }
  if (errors['email']) return 'Zadajte platnú e-mailovú adresu, napr. meno@domena.sk.';
  if (errors['pattern']) return 'Zadajte platné telefónne číslo, napr. +421 900 123 456.';
  if (errors['minlength']) {
    const { requiredLength, actualLength } = errors['minlength'] as { requiredLength: number; actualLength: number };
    return `Napíšte aspoň ${requiredLength} znakov (zatiaľ ${actualLength}).`;
  }
  if (errors['maxlength']) {
    const { requiredLength } = errors['maxlength'] as { requiredLength: number };
    return `Maximálne ${requiredLength} znakov.`;
  }
  return 'Skontrolujte toto pole.';
}
