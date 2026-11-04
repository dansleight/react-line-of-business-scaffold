import { useMemo, type FunctionComponent } from "react";
import type { DataGridActionsProps } from "./actions";
import { autoColumns, parseColumnChildren } from "./columns";
import { DataGridView } from "./DataGridView";
import type { DataGridColumnProps, DataGridProps, DataGridRow } from "./types";

export type DataGridComponent<T extends DataGridRow> = FunctionComponent<
  DataGridProps<T>
> & {
  Column: FunctionComponent<DataGridColumnProps<T>>;
  Actions: FunctionComponent<DataGridActionsProps<T>>;
};

/**
 * Bind a grid to a row type so `<Grid.Column property="…" />` has intellisense.
 * Call once at module scope: `const PersonGrid = dataGrid<Person>();`
 *
 * Omit column children (or pass `properties`) to render a column per field.
 */
export function dataGrid<T extends DataGridRow>(): DataGridComponent<T> {
  function Column(props: DataGridColumnProps<T>) {
    void props;
    return null;
  }
  Column.displayName = "DataGrid.Column";

  function Actions(props: DataGridActionsProps<T>) {
    void props;
    return null;
  }
  Actions.displayName = "DataGrid.Actions";

  function Grid({ children, properties, data, ...rest }: DataGridProps<T>) {
    const columns = useMemo(() => {
      const specified = parseColumnChildren(children, Column, Actions);
      if (specified.length > 0) return specified;
      return autoColumns(data, properties);
    }, [children, data, properties]);

    return <DataGridView {...rest} data={data} columns={columns} />;
  }
  Grid.displayName = "DataGrid";
  Grid.Column = Column;
  Grid.Actions = Actions;
  return Grid;
}
