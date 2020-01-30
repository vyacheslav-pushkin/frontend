import {
  AttributePermissionValue,
  EffectivePermsInfo,
  EntityAttrPermissionValue,
  EntityOperationType,
  EntityPermissionValue,
  Permission
} from './model';

/**
 *
 * Define which type of attribute render allowed for user
 *
 * @param entityName CUBA model entity
 * @param attributeName
 * @param perms - user effective permissions
 * @return attribute could be not allowed to display (DENY), allowed for modification (MODIFY)
 * or allowed in read only mode (VIEW).
 */
export function getAttributePermission(entityName: string,
                                       attributeName: string,
                                       perms?: EffectivePermsInfo): EntityAttrPermissionValue {

  if (!perms) return 'DENY';

  const explicitPerm: Permission<AttributePermissionValue> = perms.explicitPermissions.entityAttributes
    .find(perm => perm.target === `${entityName}:${attributeName}`);

  if (explicitPerm != null) return convertAttributePermValue(explicitPerm.value);

  const defaultValuePerm = perms.defaultValues.entityAttribute;
  if (defaultValuePerm != null) return convertAttributePermValue(defaultValuePerm);

  return perms.undefinedPermissionPolicy === 'ALLOW' ? 'MODIFY' : 'DENY';
}

/**
 * Define if operation (one of CRUD) on entity allowed or not for user
 *
 * @param entityName CUBA model entity
 * @param operation - operation to be checked (CRUD)
 * @param perms - user effective permissions
 */
export function isOperationAllowed(entityName: string,
                                   operation: EntityOperationType,
                                   perms?: EffectivePermsInfo): boolean {

  if (!perms) return false;

  const explicitPerm: Permission<EntityPermissionValue> = perms.explicitPermissions.entities
    .find(perm => perm.target === `${entityName}:${operation}`);

  if (explicitPerm != null) return explicitPerm.value === 1;

  const defaultValuePerm: EntityPermissionValue = getDefaultValuePerm(operation, perms);
  if (defaultValuePerm != null) return defaultValuePerm === 1;

  return perms.undefinedPermissionPolicy === 'ALLOW';
}

function getDefaultValuePerm(op: EntityOperationType, perms: EffectivePermsInfo): EntityPermissionValue {
  switch (op) {
    case "create":
      return perms.defaultValues.entityCreate;
    case "read":
      return perms.defaultValues.entityRead;
    case "update":
      return perms.defaultValues.entityUpdate;
    case "delete":
      return perms.defaultValues.entityDelete;
  }
}

function convertAttributePermValue(val: AttributePermissionValue): EntityAttrPermissionValue {
  switch (val) {
    case 2: return 'MODIFY';
    case 1: return 'VIEW';
    default: return 'DENY';
  }
}
