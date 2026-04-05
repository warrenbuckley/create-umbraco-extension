import { LitElement, html, css, customElement, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

@customElement('{{TAG_NAME}}')
export class {{CLASS_NAME}} extends UmbElementMixin(LitElement) {
  @state()
  private _count = 0;

  override render() {
    return html`
      <uui-box headline="{{NAME}}">
        <p>You have clicked the button <strong>${this._count}</strong> time(s).</p>
        <uui-button look="primary" @click=${this.#handleClick}>Click me</uui-button>
      </uui-box>
    `;
  }

  #handleClick() {
    this._count++;
  }

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-space-4);
    }
  `;
}

export default {{CLASS_NAME}};

declare global {
  interface HTMLElementTagNameMap {
    '{{TAG_NAME}}': {{CLASS_NAME}};
  }
}
