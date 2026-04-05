import { LitElement, html, css, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';

@customElement('{{TAG_NAME}}')
export class {{CLASS_NAME}} extends UmbElementMixin(LitElement) {
  override render() {
    return html`
      <uui-box headline="{{NAME}}">
        <!-- TODO: add dashboard content -->
      </uui-box>
    `;
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
