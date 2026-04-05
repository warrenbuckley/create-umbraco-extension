import { UmbEntityBulkActionBase } from '@umbraco-cms/backoffice/entity-bulk-action';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';

export class {{CLASS_NAME}} extends UmbEntityBulkActionBase<never> {
  override async execute() {
    const notifications = await this.getContext(UMB_NOTIFICATION_CONTEXT);

    try {
      for (const unique of this.selection) {
        // TODO: process each selected item
        console.log('Processing:', unique);
      }

      notifications?.peek('positive', {
        data: {
          headline: '{{NAME}}',
          message: `Processed ${this.selection.length} item(s) successfully.`,
        },
      });
    } catch {
      notifications?.peek('danger', {
        data: { headline: '{{NAME}}', message: 'Action failed. Please try again.' },
      });
    }
  }
}

export default {{CLASS_NAME}};
