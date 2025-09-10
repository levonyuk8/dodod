import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      class="btn btn-image"
      [ngClass]="[
      'btn',
      'btn-' + variant,
      'btn-' + size,
      'btn-' + width
      ]"
      [disabled]="disabled"
      [type]="type"
    >
      @if (imageUrl) {
        <svg>
          <use [attr.xlink:href]="imageUrl" style="--color_fill: #000;"></use>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
  imports: [
    NgClass
  ]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'transparent' | 'bg-transparent' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() imageUrl!: string;
  @Input() width!: string;
}
