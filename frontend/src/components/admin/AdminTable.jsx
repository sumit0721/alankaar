function AdminTable({ columns, rows, emptyMessage, onRowClick }) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row._id}
                className={onRowClick ? "clickable-row" : ""}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!rows.length ? <p className="admin-empty-text">{emptyMessage}</p> : null}
    </div>
  );
}

export default AdminTable;
