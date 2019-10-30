import * as React from "react";
import {RouteComponentProps} from "react-router";
import {observer} from "mobx-react";
import <%=editComponentName%> from "./<%=editComponentName%>";
import <%=listComponentName%> from "./<%=listComponentName%>";

type Props = RouteComponentProps<{entityId?: string}>;

@observer
export class <%=className%> extends React.Component<Props> {

  static PATH = '/<%=nameLiteral%>';
  static NEW_SUBPATH = 'new';

  render() {
    const {entityId} = this.props.match.params;
    return (
      <>
        {entityId
          ? <<%=editComponentName%> entityId={entityId}/>
          : <<%=listComponentName%>/>}
      </>
    )
  }
}
