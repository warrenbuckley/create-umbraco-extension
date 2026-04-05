import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';

export class {{CLASS_NAME}} extends UmbEntityActionBase<never> {
  override async execute() {
    const notifications = await this.getContext(UMB_NOTIFICATION_CONTEXT);

    try {
      // TODO: implement your action using this.unique and this.entityType
      console.log('Executing {{NAME}} on:', this.unique, '| type:', this.entityType);

      notifications?.peek('positive', {
        data: { headline: '{{NAME}}', message: 'Action completed successfully.' },
      });
    } catch {
      notifications?.peek('danger', {
        data: { headline: '{{NAME}}', message: 'Action failed. Please try again.' },
      });
    }
  }
}

export default {{CLASS_NAME}};
