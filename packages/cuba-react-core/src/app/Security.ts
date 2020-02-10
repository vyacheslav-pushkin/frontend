import {action, computed, observable, ObservableMap} from 'mobx';
import {CubaApp, EntityAttrPermissionValue, EffectivePermsInfo} from '@cuba-platform/rest';
import {getAttributePermission} from '@cuba-platform/rest/dist-node/security';

export class Security {

  @observable attrPermissionCache: ObservableMap<string, EntityAttrPermissionValue> = new ObservableMap();
  @observable effectivePermissions?: EffectivePermsInfo;
  @observable private restSupportEffectivePerms: boolean = true;
  permissionsRequestCount = 0;

  private dataLoadPromise?: Promise<EffectivePermsInfo | void>;

  constructor(private cubaREST: CubaApp) {
  }

  @computed get dataLoaded(): boolean {
    return !!this.effectivePermissions || !this.restSupportEffectivePerms;
  };

  // noinspection JSUnusedGlobalSymbols
  getAttributePermission = (entityName: string, attributeName: string): Promise<EntityAttrPermissionValue> => {

    if (!this.dataLoadPromise) return Promise.resolve('DENY');
    
    return this.dataLoadPromise.then(() => {
      // do not deny anything for rest version prev 7.2
      if (!this.restSupportEffectivePerms) return Promise.resolve('MODIFY');

      const attrFqn = `${entityName}:${attributeName}`;

      let perm = this.attrPermissionCache.get(attrFqn);
      if (perm != null) return Promise.resolve(perm);

      perm = getAttributePermission(entityName, attributeName, this.effectivePermissions);
      this.attrPermissionCache.set(attrFqn, perm);
      return Promise.resolve(perm);
    });

  };

  @action loadPermissions() {
    const requestId = ++this.permissionsRequestCount;

    this.dataLoadPromise = this.cubaREST.getEffectivePermissions()
      .then(action((effectivePermsInfo: EffectivePermsInfo) => {
        if (requestId === this.permissionsRequestCount) {
          this.effectivePermissions = effectivePermsInfo;
          this.attrPermissionCache.clear();
        }
      }))
      .catch(reason => {
        // support rest api version < 7.2
        if (reason === CubaApp.NOT_SUPPORTED_BY_API_VERSION) {
          this.restSupportEffectivePerms = false;
        } else {
          throw reason;
        }
      });
  }

}
