import * as React from "react";
import {observer} from "mobx-react";
import {FormField} from "../FormField";
import {Form} from "antd";
import {FormComponentProps, FormItemProps} from 'antd/lib/form';
import {GetFieldDecoratorOptions} from 'antd/lib/form/Form';
import {Msg} from '../Msg';
import {
  DataCollectionStore,
  getPropertyInfo,
  injectMainStore,
  MainStoreInjected,
  WithId
} from "@cuba-platform/react-core";
import {MetaClassInfo, EntityAttrPermissionValue} from "@cuba-platform/rest";
import {uuidPattern} from "../../util/regex";
import {observable, runInAction} from "mobx";

type Props = MainStoreInjected & FormComponentProps & {
  entityName: string
  propertyName: string
  optionsContainer?: DataCollectionStore<WithId>

  // form item
  formItemKey?: string
  formItemOpts?: FormItemProps

  // field decorator
  fieldDecoratorId?: string
  getFieldDecoratorOpts?: GetFieldDecoratorOptions
}

@observer
@injectMainStore
export class Field extends React.Component<Props> {

  @observable permission: EntityAttrPermissionValue = 'DENY';

  async componentDidMount() {
    const {
      entityName, propertyName
    } = this.props;

    return this.props.mainStore!.security.getAttributePermission(entityName, propertyName)
      .then((perm: EntityAttrPermissionValue) => {
      return runInAction(() => {
          this.permission = perm;
      });
    });
  }

  render() {
    const {props, permission} = this;
    const {getFieldDecorator} = props.form;

    // console.log('permission', permission);

    const {
      entityName, propertyName, optionsContainer, fieldDecoratorId, getFieldDecoratorOpts, formItemKey, mainStore
    } = props;

    // TODO this does not work
    // if (permission === 'DENY') return null;

    const formItemOpts: FormItemProps = {...props.formItemOpts};
    if (!formItemOpts.label) formItemOpts.label = <Msg entityName={entityName} propertyName={propertyName}/>;

    return <Form.Item key={formItemKey ? formItemKey : propertyName}
                      {...formItemOpts}>

      {getFieldDecorator(
        fieldDecoratorId ? fieldDecoratorId : propertyName,
        {...getDefaultOptions(mainStore?.metadata, entityName, propertyName), ...getFieldDecoratorOpts}
      )(
        <FormField entityName={entityName}
                   propertyName={propertyName}
                   disabled={permission !== 'MODIFY'}
                   optionsContainer={optionsContainer}
        />
      )}
    </Form.Item>

  };
}

function getDefaultOptions(metadata: MetaClassInfo[] | undefined, entityName: string, propertyName: string): GetFieldDecoratorOptions {
  if (!metadata) {
    return {};
  }

  const propertyInfo = getPropertyInfo(metadata, entityName, propertyName);

  if (propertyInfo?.type === 'uuid') {
    return {
      rules: [
        {pattern: uuidPattern}
      ],
      validateTrigger: 'onSubmit'
    };
  }

  return {};
}
