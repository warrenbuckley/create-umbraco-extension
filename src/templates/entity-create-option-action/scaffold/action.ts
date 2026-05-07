import { UmbEntityCreateOptionActionBase } from '@umbraco-cms/backoffice/entity-create-option-action';

export class {{CLASS_NAME}} extends UmbEntityCreateOptionActionBase {
  override async execute() {
    // TODO: implement creation logic
    // this.unique      — the parent entity's unique identifier (null at root)
    // this.entityType  — the entity type string
  }
}

export default {{CLASS_NAME}};
