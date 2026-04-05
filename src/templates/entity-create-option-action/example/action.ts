import { UmbEntityCreateOptionActionBase } from '@umbraco-cms/backoffice/entity-create-option-action';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';

export class {{CLASS_NAME}} extends UmbEntityCreateOptionActionBase {
  override async execute() {
    const notifications = await this.getContext(UMB_NOTIFICATION_CONTEXT);

    try {
      // TODO: implement your creation logic
      // Common next steps:
      //   Open a modal:  const manager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
      //   Navigate:      const router  = await this.getContext(UMB_ROUTER_CONTEXT);
      console.log('Creating under parent:', this.unique ?? 'root', '| type:', this.entityType);

      notifications?.peek('positive', {
        data: { headline: '{{NAME}}', message: 'Created successfully.' },
      });
    } catch {
      notifications?.peek('danger', {
        data: { headline: '{{NAME}}', message: 'Creation failed. Please try again.' },
      });
    }
  }
}

export default {{CLASS_NAME}};
