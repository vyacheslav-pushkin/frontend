const expect = require('chai').expect;
const security = require('../dist-node/security');

describe('security', () => {
  it('should return correct attribute permission', () => {

    expect(security.getAttributePermission('scr$Car', 'mileage', undefined))
      .eq('DENY');

    const perms = {
      explicitPermissions: {entities: [], entityAttributes: [], specific: []},
      defaultValues: {},
      undefinedPermissionPolicy: 'ALLOW'
    };
    expect(security.getAttributePermission('scr$Car', 'mileage', perms))
      .eq('MODIFY');

    perms.defaultValues.entityAttribute = 1;
    expect(security.getAttributePermission('scr$Car', 'mileage', perms))
      .eq('VIEW');

    perms.explicitPermissions.entityAttributes.push({target: 'scr$Car:mileage', value: 0});
    expect(security.getAttributePermission('scr$Car', 'mileage', perms))
      .eq('DENY');
  });

  it('should define if operation allowed or not', function () {
    expect(security.isOperationAllowed('scr$Car', 'read', undefined))
      .eq(false);

    const perms = {
      explicitPermissions: {entities: [], entityAttributes: [], specific: []},
      defaultValues: {},
      undefinedPermissionPolicy: 'ALLOW'
    };
    expect(security.isOperationAllowed('scr$Car', 'read', perms))
      .eq(true);

    perms.defaultValues = {
      entityCreate: 1,
      entityRead: 0,
      entityUpdate: 1,
      entityDelete: 1,
      entityAttribute: 2,
      specific: 1
    };
    expect(security.isOperationAllowed('scr$Car', 'read', perms))
      .eq(false);

    perms.explicitPermissions.entities = [
      {target: 'scr$Car:read', value: 1},
      {target: 'scr$Car:create', value: 0},
      {target: 'scr$Car:update', value: 0},
      {target: 'scr$Car:delete', value: 0}
    ];
    expect(security.isOperationAllowed('scr$Car', 'read', perms))
      .eq(true);

  });
});