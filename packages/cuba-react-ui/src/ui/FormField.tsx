import * as React from "react";
import {Checkbox, DatePicker, Input, Select, TimePicker} from "antd";
import {observer} from "mobx-react";
import {Cardinality, EnumInfo, EnumValueInfo, MetaPropertyInfo, PropertyType} from "@cuba-platform/rest"
import {FileUpload, FileUploadProps} from './FileUpload';
import {EntitySelectField} from "./EntitySelectField";
import {MainStoreInjected, DataCollectionStore, WithId, injectMainStore, getPropertyInfo, isFileProperty} from "@cuba-platform/react-core";
import './form/InputNumber.less';
import {UuidInput} from "./form/UuidInput";
import {DoubleInput} from "./form/DoubleInput";
import {IntegerInput} from "./form/IntegerInput";
import {LongInput} from "./form/LongInput";
import {BigDecimalInput} from "./form/BigDecimalInput";
import {SelectProps} from "antd/lib/select";
import {InputProps} from "antd/lib/input/Input";
import {CheckboxProps} from "antd/lib/checkbox/Checkbox";
import {DatePickerProps} from "antd/lib/date-picker/interface";
import {TimePickerProps} from "antd/lib/time-picker";
import {InputNumberProps} from "antd/lib/input-number";
import {NestedEntityField, NestedEntityFieldProps} from "./form/NestedEntityField";
import {NestedEntitiesTableField, NestedEntitiesTableFieldProps} from "./form/NestedEntitiesTableField";

export type FormFieldComponentProps = SelectProps | InputProps | InputNumberProps | CheckboxProps | DatePickerProps | TimePickerProps | FileUploadProps
  | NestedEntityFieldProps | NestedEntitiesTableFieldProps;

// TODO We should probably make it an interface as it is not convenient to document type declarations with TSDoc.
// TODO However, that would be a minor breaking change, as interface cannot extend FormFieldComponentProps.
/**
 * See {@link FieldProps}
 */
export type FormFieldProps = MainStoreInjected & {
  entityName: string;
  propertyName: string;
  disabled?: boolean;
  optionsContainer?: DataCollectionStore<WithId>;
  nestedEntityView?: string;
  parentEntityInstanceId?: string;
} & FormFieldComponentProps;

export const FormField = injectMainStore(observer((props: FormFieldProps) => {

  const {
    entityName, propertyName, optionsContainer, mainStore, nestedEntityView, parentEntityInstanceId,
    ...rest
  } = props;

  if (mainStore == null || mainStore.metadata == null) {
    return <Input {...(rest as InputProps)}/>;
  }
  const propertyInfo = getPropertyInfo(mainStore!.metadata, entityName, propertyName);
  if (propertyInfo == null) {
    return <Input {...(rest as InputProps)}/>
  }

  if (isFileProperty(propertyInfo)) {
    return <FileUpload {...(rest as FileUploadProps)}/>;
  }

  switch (propertyInfo.attributeType) {
    case 'ENUM':
      return <EnumField enumClass={propertyInfo.type} allowClear={getAllowClear(propertyInfo)} {...rest}/>;
    case 'ASSOCIATION':
      const mode = getSelectMode(propertyInfo.cardinality);
      return <EntitySelectField {...{mode, optionsContainer}} allowClear={getAllowClear(propertyInfo)} {...rest}/>;
    case 'COMPOSITION':
      if (nestedEntityView) {
        const nestedEntityName = mainStore.metadata.find(metaClass => metaClass.entityName === entityName)?.properties
          .find(property => property.name === propertyName)?.type;

        if (nestedEntityName) {
          if (propertyInfo.cardinality === 'ONE_TO_ONE') {
            return <NestedEntityField nestedEntityName={nestedEntityName}
                                      nestedEntityView={nestedEntityView}
                                      {...(rest as NestedEntityFieldProps)}
            />;
          }

          if (propertyInfo.cardinality === 'ONE_TO_MANY') {
            return <NestedEntitiesTableField nestedEntityName={nestedEntityName}
                                             nestedEntityView={nestedEntityView}
                                             parentEntityName={entityName}
                                             parentEntityInstanceId={parentEntityInstanceId}
                                             {...(rest as NestedEntitiesTableFieldProps)}
            />;
          }
        }
      }
      return null;
  }
  switch (propertyInfo.type as PropertyType) {
    case 'boolean':
      return <Checkbox {...(rest as CheckboxProps)}/>;
    case 'date':
    case 'localDate':
      return <DatePicker {...(rest as DatePickerProps)}/>;
    case 'dateTime':
    case 'localDateTime':
    case 'offsetDateTime':
      return <DatePicker showTime={true} {...(rest as DatePickerProps)}/>;
    case 'time':
    case 'localTime':
    case 'offsetTime':
      return <TimePicker {...(rest as TimePickerProps)}/>;
    case 'int':
      return <IntegerInput {...(rest as InputNumberProps)}/>;
    case 'double':
      return <DoubleInput {...(rest as InputNumberProps)}/>;
    case 'long':
      return <LongInput {...(rest as InputNumberProps)}/>;
    case 'decimal':
      return <BigDecimalInput {...(rest as InputNumberProps)}/>;
    case 'uuid':
      return <UuidInput {...(rest as InputProps)}/>
  }
  return <Input {...(rest as InputProps)}/>;
}));


export const EnumField = injectMainStore(observer(({enumClass, mainStore, ...rest}) => {
  let enumValues: EnumValueInfo[] = [];
  if (mainStore!.enums != null) {
    const enumInfo = mainStore!.enums.find((enm: EnumInfo) => enm.name === enumClass);
    if (enumInfo != null) {
      enumValues = enumInfo.values;
    }
  }
  return <Select {...rest} >
    {enumValues.map(enumValue =>
      <Select.Option key={enumValue.name} value={enumValue.name}>{enumValue.caption}</Select.Option>
    )}
  </Select>
}));

function getSelectMode(cardinality: Cardinality): "default" | "multiple" {
  if (cardinality === "ONE_TO_MANY" || cardinality === "MANY_TO_MANY") {
    return "multiple"
  }
  return "default";
}

function getAllowClear(propertyInfo: MetaPropertyInfo): boolean {
  return !propertyInfo.mandatory;
}
